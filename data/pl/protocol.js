// Polish text for the Protocol data lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/protocol.js.
export const topics = {
  block: {
    title: "Blok",
    aliases: ["blok wykonawczy", "obiekt bloku", "getBlockByNumber", "body bloku", "uncles", "ommers"],
    summary: "Blok warstwy wykonawczej to [[block-header|nagłówek]] plus body, czyli uporządkowane [[transaction|transakcje]] i [[withdrawals|wypłaty]], które klienci wykonują jako jeden niepodzielny krok od [[state|stanu]] bloku rodzica do nowego stanu. Identyfikują go numer i [[block-hash|hash]].",
    sections: [
      {
        heading: "Nagłówek i body",
        paragraphs: [
          "[[block-header|Nagłówek]] to stała lista pól, która jest commitmentem do całej reszty: `stateRoot`, `transactionsRoot`, `receiptsRoot` i `withdrawalsRoot` to hashe korzeni drzew zbudowanych z danych, które blok zużył albo wytworzył, a `logsBloom` podsumowuje jego [[event-log|logi]]. Body (zawartość bloku) to uporządkowane [[transaction|transakcje]] i [[withdrawals|wypłaty]], które dodała [[consensus-layer|warstwa konsensusu]]. Jedno pole body przetrwało z czasów proof of work: lista ommerów (uncles), od [[the-merge|Merge]] zawsze pusta, więc `sha3Uncles` to zawsze hash pustej listy, a `uncles` w RPC to zawsze `[]`.",
          "Wykonanie bloku działa na zasadzie wszystko albo nic. Każdy klient, który zastosuje ten sam blok do tego samego stanu rodzica, musi wyliczyć ten sam `stateRoot`, inaczej odrzuca blok jako nieważny. Kolejność w body ustala proposer i ma ona znaczenie, bo transakcja N działa na stanie pozostawionym przez transakcję N-1; to właśnie ta zależność sprawia, że [[mev|kolejność]] jest warta pieniądze."
        ]
      },
      {
        heading: "Jeden blok na slot",
        paragraphs: [
          "Od Merge blok wykonawczy powstaje jako [[execution-payload|execution payload]], przenoszony wewnątrz [[beacon-block|bloku beacon]] dla jednego 12-sekundowego [[slot-epoch|slotu]] i przekazywany [[execution-client|klientowi wykonawczemu]] przez [[engine-api|Engine API]]. Numery pozostają kolejne, ale czas nie: pominięty slot nie daje bloku, więc `timestamp` skacze o 24 sekundy, a `number` i tak rośnie o jeden. Nie należy przeliczać liczby bloków na upływ czasu ani zakładać, że blok N powstał w chwili genesis plus dwanaście razy N."
        ]
      },
      {
        heading: "Obiekt bloku w RPC",
        paragraphs: [
          "[[eth-get-block-by-number|eth_getBlockByNumber]] i `eth_getBlockByHash` zwracają jeden obiekt JSON, który łączy pola nagłówka z body i z wartościami wyliczanymi przez węzeł: `hash`, `size` (długość kodowania [[rlp|RLP]] w bajtach), `transactions`, `withdrawals` i `uncles`. Drugi parametr, typu boolean, decyduje, czy `transactions` zawiera 32-bajtowe hashe, czy pełne obiekty [[transaction|transakcji]], co przy zatłoczonym bloku oznacza różnicę między kilkoma kilobajtami a kilkuset. Dla nieznanego bloku metoda zwraca `null`, a nie [[rpc-errors|błąd]].",
          "Blok jest też jednostką spójności dla wszystkich innych odczytów. [[block-tag|Tag bloku]] albo numer wybiera stan, na podstawie którego odpowiada odczyt, [[eth-get-logs|eth_getLogs]] przyjmuje zakres bloków, a każdy [[transaction-receipt|receipt]] wskazuje blok, który go wytworzył. Gdy kilka wartości musi się ze sobą zgadzać, trzeba przypiąć je wszystkie do jednego numeru bloku albo [[block-hash|hasha bloku]], zamiast wysyłać osobne wywołania na `latest`."
        ]
      }
    ],
    example: {
      title: "Blok pobrany tylko z hashami transakcji (skrót)",
      note: "Przekazanie `true` jako drugiego parametru zastępuje każdy hash w `transactions` pełnym obiektem transakcji; wszystkie pozostałe pola się nie zmieniają."
    },
    pitfalls: [
      "Traktowanie numerów bloków jak zegara; pominięty slot zabiera 12 sekund, ale nie zabiera numeru, więc gdy potrzebny jest czas, trzeba czytać `timestamp`.",
      "Pobieranie pełnych obiektów transakcji, gdy wystarczyłyby hashe, co mnoży rozmiar odpowiedzi i koszt u providera dla każdego skanowanego bloku.",
      "Zakładanie, że numer identyfikuje blok; po [[reorg|reorgu]] (reorganizacji łańcucha) ten sam numer może oznaczać inną zawartość, dlatego receipty i logi niosą też `blockHash`."
    ]
  },
  "block-header": {
    title: "Nagłówek bloku",
    aliases: [
      "nagłówek",
      "pola nagłówka",
      "block header",
      "stateRoot",
      "baseFeePerGas",
      "prevRandao",
      "mixHash",
      "withdrawalsRoot",
      "excessBlobGas",
      "parentBeaconBlockRoot",
      "requestsHash"
    ],
    summary: "Nagłówek bloku to rekord z mniej więcej dwudziestoma polami. Zawiera commitmenty (hashe, które jednoznacznie wiążą dane) do [[state|stanu]] [[block|bloku]], jego [[transaction|transakcji]], [[transaction-receipt|receiptów]] i [[withdrawals|wypłat walidatorów]] (withdrawals), przenosi pozycję w łańcuchu i parametry opłat, a hash samego nagłówka to [[block-hash|hash bloku]].",
    sections: [
      {
        heading: "Commitmenty w nagłówku",
        paragraphs: [
          "Cztery pola to korzenie [[merkle-patricia-trie|trie typu Merkle-Patricia]]. `stateRoot` to commitment do całego [[state|stanu globalnego]] w postaci, jaką ma po wykonaniu bloku, i dlatego [[eth-get-proof|eth_getProof]] może udowodnić saldo względem tego korzenia. `transactionsRoot`, `receiptsRoot` i `withdrawalsRoot` to commitmenty do list z body bloku; każda z nich jest zbudowana jako trie, w którym kluczem jest zakodowany w [[rlp|RLP]] indeks elementu. `logsBloom` nie jest korzeniem, tylko 2048-bitowym [[logs-bloom|filtrem Blooma]] zbudowanym z adresów i topics wszystkich logów w bloku, a `requestsHash` (dodany w Pectra przez EIP-7685) to commitment do [[execution-requests|żądań warstwy wykonawczej]] (execution requests), takich jak depozyty i wyjścia walidatorów.",
          "Skoro to commitmenty, sam nagłówek wystarczy, żeby sprawdzić dane z body bloku otrzymane z innego źródła. Po zmianie jednego bajtu jednej transakcji zmienia się `transactionsRoot`, prawie na pewno `receiptsRoot`, zmienia się też `stateRoot`, a w efekcie również hash bloku."
        ]
      },
      {
        heading: "Pozycja, gas i opłaty",
        paragraphs: [
          "`parentHash` łączy ten nagłówek z poprzednim i to dzięki niemu łańcuch jest łańcuchem; przechodząc wstecz po `parentHash`, klient albo [[indexer|indekser]] sprawdza, czy ma ciągłą historię. `number` to wysokość bloku, `timestamp` to uniksowy czas [[slot-epoch|slotu]] w sekundach, a `extraData` to maksymalnie 32 bajty dowolnej treści, których builderzy używają jako podpisu.",
          "`gasLimit` to pojemność bloku; proposer może ją zmienić w każdym bloku najwyżej o limit bloku rodzica podzielony przez 1024. `gasUsed` to gas, który transakcje faktycznie zużyły. `baseFeePerGas` to spalana cena za jednostkę [[gas|gasu]], wyliczana z bloku rodzica według [[eip-1559|EIP-1559]]. `blobGasUsed` i `excessBlobGas` pełnią tę samą rolę na osobnym rynku opłat za [[blob|bloby]]: `excessBlobGas` to narastająca nadwyżka przenoszona z bloku na blok, a z niej wylicza się blob base fee (`eth_blobBaseFee`)."
        ]
      },
      {
        heading: "Pola, które zmieniły znaczenie",
        paragraphs: [
          "Trzy pola to pozostałości po proof of work. W każdym bloku po [[the-merge|Merge]] `difficulty` wynosi `0x0`, a `nonce` wynosi `0x0000000000000000`. EIP-4399 zmieniło przeznaczenie `mixHash`: pole niesie teraz `prevRandao`, czyli losowość [[consensus-layer|warstwy konsensusu]] dla danego slotu, a większość klientów nadal pokazuje je w JSON-ie pod nazwą `mixHash`; wewnątrz [[evm|EVM]] dawny opcode `DIFFICULTY` zwraca teraz tę wartość jako `PREVRANDAO`. Pole `miner` to fee recipient (odbiorca opłat) z payloadu. W bloku kupionym przez [[mev-boost|MEV-Boost]] jest to zwykle adres buildera, a proposer [[validator-rewards|dostaje zapłatę przelewem na końcu bloku]].",
          "`parentBeaconBlockRoot` (EIP-4788, Dencun) umieszcza w nagłówku warstwy wykonawczej root nadrzędnego [[beacon-block|bloku beacon]] (parent beacon block root), dzięki czemu kontrakty mogą weryfikować dane konsensusu. Nie jest to to samo co [[block-hash|hash bloku]] rodzica w warstwie wykonawczej."
        ]
      },
      {
        heading: "Odczyt nagłówków przez RPC",
        paragraphs: [
          "[[eth-get-block-by-number|eth_getBlockByNumber]] zwraca każde pole nagłówka pod nazwą ze specyfikacji, razem z `hash`, `size` i body bloku. Pól dodanych w danym forku po prostu nie ma w starszych blokach: `baseFeePerGas` pojawia się od London, `withdrawalsRoot` od Shapella, pola blobów i beacon root od Dencun, a `requestsHash` od Pectra. Trzeba je dekodować jako opcjonalne, a brak pola traktować jako znak, że blok pochodzi sprzed forka, a nie jako błąd."
        ]
      }
    ],
    example: {
      title: "Pola nagłówka niedawnego bloku (skrócone)",
      note: "`extraData` dekoduje się do ciągu ASCII `beaverbuild.org`, a `blobGasUsed` równe `0xc0000` to dokładnie sześć blobów po 131 072 jednostki blob gasu."
    },
    pitfalls: [
      "Traktowanie `mixHash` jak pozostałości po kopaniu; od Merge pole niesie `prevRandao`, więc kontrakty, które używają go jako źródła losowości, czytają wynik warstwy konsensusu.",
      "Zakładanie, że każde pole nagłówka istnieje w każdym bloku; w bloku sprzed Shapella pola `withdrawalsRoot` po prostu nie ma, a restrykcyjne dekodery się na tym wysypują.",
      "Mylenie `parentBeaconBlockRoot` z `parentHash`; pierwsze wskazuje blok warstwy konsensusu, drugie blok warstwy wykonawczej.",
      "Traktowanie `miner` jako walidatora, który był proposerem bloku; przy zewnętrznym budowaniu bloków jest to zwykle fee recipient buildera."
    ]
  },
  "block-hash": {
    title: "Hash bloku",
    aliases: ["blockHash", "block hash", "getBlockByHash", "BLOCKHASH", "hash nagłówka", "header hash"],
    summary: "Hash bloku to wynik [[keccak-256|Keccak-256]] z zakodowanego w [[rlp|RLP]] [[block-header|nagłówka]]: 32 bajty, które zmieniają się, gdy zmieni się którekolwiek pole nagłówka, i dlatego wskazują jeden konkretny [[block|blok]] razem z całą jego zawartością.",
    sections: [
      {
        heading: "Jak się go wylicza",
        paragraphs: [
          "Wystarczy zhashować kodowanie RLP listy pól nagłówka i ma się hash bloku. Nic więcej nie jest hashowane bezpośrednio, bo nagłówek już zawiera commitment do body bloku przez `transactionsRoot`, `withdrawalsRoot` i `receiptsRoot`, a do wyniku wykonania przez `stateRoot`. Każda zmiana w dowolnym miejscu bloku przenosi się więc na hash. Nie trzeba też w tej sprawie ufać żadnemu węzłowi: klient, który ma nagłówek, sam przelicza hash, a [[engine-api|Engine API]] ma osobny status `INVALID_BLOCK_HASH` dla payloadu, którego deklarowany hash nie zgadza się z jego polami."
        ]
      },
      {
        heading: "Hash a numer",
        paragraphs: [
          "Numer bloku to pozycja w łańcuchu, a hash bloku to jego tożsamość. Podczas [[reorg|reorgu]] (reorganizacji łańcucha) dwa różne bloki mogą jednocześnie mieć ten sam numer, a jeden z nich przegra. Dlatego odbiorcy danych, którzy nie mogą niczego policzyć dwa razy, na przykład [[indexer|indekser]], zapisują `blockHash` i `parentHash` każdego przetworzonego bloku: jeśli `parentHash` nowego heada nie jest równy zapisanemu hashowi, nastąpił reorg i dane pochodne trzeba wycofać.",
          "[[block-tag|EIP-1898]] pozwala metodom odczytu przyjąć zamiast numeru `{\"blockHash\": \"0x…\", \"requireCanonical\": true}`, więc węzeł odpowiada z dokładnie tego bloku albo zwraca jednoznaczny błąd, jeśli blok nie jest już kanoniczny. Eliminuje to wyścig, w którym wywołanie przeznaczone dla bloku N dostaje odpowiedź z innego bloku o numerze N."
        ]
      },
      {
        heading: "Gdzie się pojawia",
        paragraphs: [
          "`eth_getBlockByHash` przyjmuje hash bloku, [[eth-get-logs|eth_getLogs]] akceptuje `blockHash` zamiast zakresu od `fromBlock` do `toBlock` (zwykle bez limitów zakresu narzucanych przez providera, bo chodzi o jeden blok), a każdy [[transaction-receipt|receipt]] i [[event-log|log]] zawiera `blockHash` bloku, z którego pochodzi. Wewnątrz [[evm|EVM]] opcode `BLOCKHASH` zwraca hash jednego z 256 najnowszych bloków, a poza tym oknem zero; EIP-2935 z Pectra dodatkowo zapisuje 8191 ostatnich hashy w [[system-contracts|kontrakcie systemowym]], który mogą odczytywać inne kontrakty.",
          "Jeden hash, który wygląda podobnie, oznacza coś innego: root [[beacon-block|bloku beacon]] identyfikuje blok konsensusu, który opakował ten payload, a [[beacon-api|Beacon API]] wyszukuje bloki właśnie po nim, a nie po hashu bloku wykonawczego. Podanie jednego tam, gdzie oczekiwany jest drugi, kończy się odpowiedzią not found, a nie błędem typu."
        ]
      }
    ],
    pitfalls: [
      "Cache'owanie niezmiennych danych pod numerem bloku; po reorgu ten sam numer wskazuje inną zawartość, więc kluczem powinien być `blockHash`.",
      "Przekazywanie hasha bloku wykonawczego do endpointu Beacon API, takiego jak `/eth/v2/beacon/blocks/{block_id}`, który oczekuje rootu bloku beacon.",
      "Oczekiwanie, że `BLOCKHASH` w kontrakcie sięga dowolnie daleko wstecz; poza oknem 256 bloków zwraca zero, które naiwny kod bierze za prawidłowy hash.",
      "Porównywanie hashy jako tekstu bez ujednolicenia wielkości liter; klienci zwracają hex małymi literami, ale dane od użytkownika i niektóre narzędzia już nie."
    ]
  },
  transaction: {
    title: "Transakcja",
    aliases: ["tx", "podpisana transakcja", "calldata", "input data", "hash transakcji"],
    summary: "Transakcja to wiadomość podpisana przez [[account|konto EOA]], która każe sieci przelać wartość, wywołać [[smart-contract|smart kontrakt]] albo wdrożyć nowy. To jedyny sposób, w jaki cokolwiek w Ethereum zmienia [[state|stan]].",
    sections: [
      {
        heading: "Czym jest transakcja",
        paragraphs: [
          "Transakcję może zainicjować tylko konto EOA, bo transakcja jest ważna wyłącznie wtedy, gdy z jej [[ecdsa-signature|podpisu ECDSA]] da się odzyskać adres nadawcy. Wszystko, co kontrakt robi potem, łącznie z wywołaniami innych kontraktów, dzieje się wewnątrz tej jednej transakcji. Te wywołania wewnętrzne nie mają hasha ani [[transaction-receipt|receiptu]] i w ogóle nie istnieją w body [[block|bloku]], dlatego widać je tylko w [[execution-trace|trace wykonania]]. Transakcja jest też jednostką atomowości: albo zostaje zastosowana w całości, albo, jeśli zakończy się [[revert|revertem]], nie zostawia po sobie żadnej zmiany stanu poza zwiększeniem [[nonce|nonce]] i zużytym [[gas|gasem]]."
        ]
      },
      {
        heading: "Pola",
        paragraphs: [
          "Podpisana transakcja zawiera `nonce`, `to`, `value` w [[wei|wei]], `input` (calldata, w starszych narzędziach nazywane `data`), `gas` (limit, który nadawca jest gotów wydać), pola opłat, `chainId` oraz podpis jako `r`, `s` i `v` albo `yParity`. [[transaction-types|Transakcja typowana]] dodaje, zależnie od typu, `accessList`, `blobVersionedHashes` albo `authorizationList`. Przy wdrożeniu kontraktu `to` ma wartość `null`; wtedy `input` to init code (kod inicjujący), a nowy [[address|adres]] jest wyliczany z nadawcy i nonce.",
          "Pola opłat zależą od typu: transakcje legacy mają jedno pole `gasPrice`, a transakcje [[eip-1559|EIP-1559]] mają `maxFeePerGas` i `maxPriorityFeePerGas`. Faktycznie zapłaconej ceny w ogóle nie ma w transakcji; pojawia się ona jako `effectiveGasPrice` w receipcie, gdy już wiadomo, ile wynosi base fee bloku.",
          "Obiekt transakcji zwracany przez [[eth-get-transaction-by-hash|eth_getTransactionByHash]] ma dodatkowe pola, których nikt nigdy nie podpisał: `from` jest odzyskiwane z podpisu, a `hash`, `blockHash`, `blockNumber` i `transactionIndex` opisują, gdzie węzeł tę transakcję znalazł. Dla transakcji, która wciąż czeka w [[mempool|mempoolu]], trzy ostatnie mają wartość `null`."
        ]
      },
      {
        heading: "Od podpisu do receiptu",
        paragraphs: [
          "Nadawca składa pola, podpisuje swoim kluczem prywatnym hash [[keccak-256|Keccak-256]] zakodowanego payloadu i serializuje wynik. Hash tej zserializowanej postaci to hash transakcji, dlatego zmiana dowolnego pola, nawet limitu gasu, daje inną transakcję. Podpisane bajty trafiają do węzła przez [[eth-send-raw-transaction|eth_sendRawTransaction]], który sprawdza je według reguł mempoolu i od razu zwraca hash. [[transaction-lifecycle|Włączenie do bloku to osobny etap]]: proposer wybiera transakcję, blok zostaje wykonany i dopiero wtedy powstaje receipt."
        ]
      }
    ],
    example: {
      title: "Transakcja z dynamiczną opłatą zwrócona przez RPC (skrót)",
      note: "`value` wynosi `0x0`, bo ten transfer w ogóle nie przenosi etheru: `input` to zakodowane w [[abi|ABI]] wywołanie `transfer(address,uint256)` na kontrakcie tokena."
    },
    pitfalls: [
      "Traktowanie `from` jak podpisanych danych; to pole jest odzyskiwane z podpisu, więc nieprawidłowy podpis daje innego nadawcę, a nie brak nadawcy.",
      "Zakładanie, że hash transakcji oznacza włączenie do bloku; hash istnieje od chwili podpisania transakcji, nawet jeśli żaden węzeł nigdy jej nie przyjmie.",
      "Mierzenie transferu tokenów przez odczyt `value`; przeniesienie tokenów to calldata i [[event-log|logi]], a `value` pozostaje `0x0`.",
      "Ponowne zbudowanie i podpisanie transakcji, żeby podbić opłatę, bez zachowania tego samego [[nonce|nonce]], przez co zamiast zastąpić pierwszą transakcję, wysyła się drugą."
    ]
  },
  "transaction-types": {
    title: "Transakcje typowane",
    aliases: ["EIP-2718", "typ 0x2", "typ 0x3", "envelope", "0x1", "0x4", "transakcja legacy", "typy transakcji"],
    summary: "EIP-2718 opakowuje każdy nowy format [[transaction|transakcji]] we wspólny format transakcji typowanych (typed transaction envelope), w którym pierwszy bajt to typ, więc protokół może dodawać pola, nie psując starszych formatów: `0x0` legacy, `0x1` access list, `0x2` dynamic fee, `0x3` blob, `0x4` set code.",
    sections: [
      {
        heading: "Format transakcji typowanych",
        paragraphs: [
          "Transakcja typowana jest serializowana jako jeden bajt typu, a po nim payload danego typu, zwykle lista [[rlp|RLP]]. Transakcja legacy w ogóle nie ma bajtu typu; to goła lista RLP, a ponieważ lista RLP zawsze zaczyna się od bajtu `0xc0` lub wyższego, dekoder rozróżni oba formaty po pierwszym bajcie. Typy są zarezerwowane od `0x00` do `0x7f`, co zostawia miejsce na przyszłe formaty i pozwala też [[rollup|rollupowi]] zdefiniować własne, na przykład typ depozytu OP Stack `0x7e`, który nie ma podpisu.",
          "Bajt typu wchodzi w to, co jest hashowane i podpisywane, więc transakcji nie da się zinterpretować jako innego typu. W RPC typ pojawia się jako `type` zarówno w obiekcie [[transaction|transakcji]], jak i w jej [[transaction-receipt|receipcie]], a bajty przekazywane do [[eth-send-raw-transaction|eth_sendRawTransaction]] to dokładnie ten format, zakodowany w hex."
        ]
      },
      {
        heading: "Pięć typów",
        paragraphs: [
          "`0x0` to pierwotny format: `nonce`, `gasPrice`, `gas`, `to`, `value`, `data` i podpis, którego `v` koduje [[chain-id|chain ID]] zgodnie z EIP-155. `0x1` (EIP-2930) zachowuje `gasPrice`, ale dodaje jawne `chainId`, [[access-list|accessList]] i `yParity` zamiast przeładowanego znaczeniami `v`. `0x2` (EIP-1559) zastępuje `gasPrice` parą `maxFeePerGas` i `maxPriorityFeePerGas` i to właśnie ten typ portfele wysyłają dziś domyślnie.",
          "`0x3` (EIP-4844) dodaje `maxFeePerBlobGas` i `blobVersionedHashes` dla transakcji [[blob|przenoszących bloby]]. Taka transakcja nie może wdrożyć kontraktu, więc `to` musi być ustawione, a same bloby nie trafiają do bloku: transakcja zawiera do nich commitment w postaci versioned hash, a dane krążą jako sidecar w sieci konsensusu. `0x4` (EIP-7702, Pectra) dodaje `authorizationList`, który kieruje [[account|konto EOA]] na kod kontraktu; zobacz [[eip-7702|transakcje set code]]."
        ]
      },
      {
        heading: "Co to oznacza dla wywołujących",
        paragraphs: [
          "Dekodery muszą traktować pola jako zależne od typu. Transakcja typu `0x2` nie ma `maxFeePerBlobGas`, typ `0x0` nie ma `accessList`, a klienci różnią się tym, czy przy transakcjach dynamic fee zwracają syntetyczne `gasPrice`, więc faktycznie zapłaconą cenę trzeba brać z `effectiveGasPrice` w receipcie. Wszystko, co parsuje surowe transakcje, w tym narzędzia obserwujące [[mempool|mempool]], musi rozgałęziać się według pierwszego bajtu, zamiast zakładać listę RLP.",
          "Węzeł odrzuci nieznany typ [[rpc-errors|błędem]] w rodzaju „transaction type not supported”. To typowy objaw wysłania transakcji w nowym formacie do klienta, którego nie zaktualizowano przed [[hardfork|aktualizacją sieci]]."
        ]
      }
    ],
    example: {
      title: "Ta sama płatność jako legacy i jako dynamic fee",
      note: "`0x26` w `v` transakcji legacy to 38, co zgodnie z EIP-155 koduje jednocześnie recovery bit i chain ID 1; forma typowana trzyma je osobno jako `yParity` i `chainId`."
    },
    pitfalls: [
      "Pisanie dekodera surowych transakcji, który zakłada RLP; wszystko od typu `0x1` wzwyż zaczyna się zamiast tego od jednego bajtu typu.",
      "Wysyłanie `gasPrice` razem z `maxFeePerGas` w jednym obiekcie wywołania, co klienci odrzucają jako sprzeczne pola opłat.",
      "Zakładanie, że transakcja blobowa pobrana przez RPC zawiera swoje bloby; w transakcji jest tylko `blobVersionedHashes`.",
      "Zakodowanie na sztywno listy znanych typów; każda [[hardfork|aktualizacja sieci]] może dodać nowy, a nieznane typy trzeba pomijać, a nie źle parsować."
    ]
  },
  "transaction-receipt": {
    title: "Receipt transakcji",
    aliases: ["receipt", "transaction receipt", "receipty", "status", "gasUsed", "cumulativeGasUsed", "effectiveGasPrice", "logs"],
    summary: "Receipt (wynik wykonania transakcji) to zapisany przez węzeł rekord tego, co się stało, gdy jedna [[transaction|transakcja]] wykonała się w [[block|bloku]]: czy się udała, ile [[gas|gasu]] zużyła, ile zapłaciła i jakie [[event-log|logi]] wyemitowała.",
    sections: [
      {
        heading: "Co zawiera",
        paragraphs: [
          "`status` ma wartość `0x1` przy sukcesie i `0x0` przy [[revert|revercie]] lub innej porażce; receipty sprzed aktualizacji Byzantium z 2017 roku zamiast niego zawierają `root` stanu po transakcji. `gasUsed` to gas zużyty przez tę transakcję, a `cumulativeGasUsed` to suma narastająca dla bloku aż do tej transakcji włącznie, więc różnica między kolejnymi receiptami to zużycie jednej transakcji. `effectiveGasPrice` to cena faktycznie zapłacona za jednostkę gasu; dla transakcji [[eip-1559|EIP-1559]] jest to base fee bloku plus napiwek, który zmieścił się pod `maxFeePerGas`. `logs` i `logsBloom` niosą eventy, `contractAddress` zawiera nowy [[address|adres]] przy wdrożeniu kontraktu, a w innym przypadku `null`, zaś transakcje z blobami dodają `blobGasUsed` i `blobGasPrice`.",
          "Receipt to nie transakcja. Nie ma pól `input` ani `value`, nie ma też limitów opłat; to wszystko zostaje w obiekcie [[transaction|transakcji]]. Używanie ich w parze jest normalne: [[eth-get-transaction-by-hash|eth_getTransactionByHash]] mówi, o co poproszono, a [[eth-get-transaction-receipt|eth_getTransactionReceipt]], co się stało."
        ]
      },
      {
        heading: "Dane konsensusu a dane pochodne",
        paragraphs: [
          "Tylko część receiptu to dane protokołu. Receipt konsensusowy, który trafia do trie `receiptsRoot` bloku, zawiera typ, status (albo, przed Byzantium, pośredni [[state-root|state root]]), `cumulativeGasUsed`, filtr Blooma i logi. Wszystko inne w obiekcie RPC, w tym `gasUsed`, `effectiveGasPrice`, `contractAddress`, `blockHash` i `transactionIndex`, klient odtwarza z bloku i z pozycji transakcji w nim. Dlatego receipty można zwracać tylko dla bloków, które węzeł wciąż ma zaindeksowane. [[pruned-node|Węzeł, który usunął starą historię]], zwraca `null` dla hasha, którego jego indeks transakcji już nie obejmuje, bo nie potrafi odróżnić starej transakcji od takiej, która nigdy nie istniała. Na zapytanie o receipty wskazanego bloku sprzed tej granicy, na przykład [[eth-get-block-receipts|eth_getBlockReceipts]], odpowiada natomiast [[rpc-errors|błędem]] `4444` „Pruned history unavailable”.",
          "Ponieważ korzeń obejmuje logi, receipt da się udowodnić: bridge albo [[light-client|lekki klient]] może wykazać, że log został wyemitowany, przedstawiając receipt i jego ścieżkę w trie względem `receiptsRoot`; zobacz [[receipt-proof|dowody receiptów]]."
        ]
      },
      {
        heading: "Kiedy receipt istnieje",
        paragraphs: [
          "Receipt powstaje w wyniku wykonania, więc istnieje dopiero po włączeniu transakcji do bloku. [[eth-call|eth_call]] i [[eth-estimate-gas|eth_estimateGas]] tylko symulują i nigdy go nie tworzą, transakcja czekająca w [[mempool|mempoolu]] go nie ma, a zapytanie w każdym z tych przypadków zwraca `null`. Po [[reorg|reorgu]] receipt może zniknąć i wrócić z innym `blockHash`, dlatego żeby uznać transakcję za pewną, trzeba sprawdzić receipt, a potem śledzić głębokość jej bloku albo [[block-tag|tag bloku]] `finalized`."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie `status` jako jedynego sygnału porażki operacji zbiorczej; kontrakt może przechwycić wewnętrzny revert i mimo to zakończyć się z `status` równym `0x1`.",
      "Oczekiwanie logów z transakcji zakończonej revertem; revert odrzuca całą ramkę wywołania (call frame), więc gdy `status` to `0x0`, `logs` jest puste.",
      "Używanie `cumulativeGasUsed` jako kosztu transakcji; ta wartość obejmuje wszystkie wcześniejsze transakcje w bloku.",
      "Mnożenie `gas` z transakcji przez `effectiveGasPrice`, żeby wyliczyć opłatę; limit to nie zużyty gas; zużyty gas to `gasUsed`."
    ]
  },
  nonce: {
    title: "Nonce konta",
    aliases: ["liczba transakcji", "nonce too low", "zastąpienie transakcji", "zablokowana transakcja", "getTransactionCount"],
    summary: "Nonce konta to liczba transakcji, które [[account|konto]] już wysłało. Jest zapisany w każdej [[transaction|transakcji]], dzięki czemu sieć wykonuje transakcje tego konta dokładnie raz i w kolejności wybranej przez nadawcę.",
    sections: [
      {
        heading: "Kolejność i ochrona przed powtórzeniem",
        paragraphs: [
          "Każde konto EOA zaczyna od nonce `0x0`, a wartość rośnie o jeden z każdą transakcją tego konta, która trafi do [[block|bloku]], także z taką, która zakończy się [[revert|revertem]]. Transakcja z nonce niższym niż bieżąca wartość konta jest nieważna na zawsze i węzeł odrzuca ją z błędem „nonce too low”. Transakcja z nonce wyższym jest ważna, ale jeszcze nie da się jej wykonać: czeka w części queued [[mempool|mempoolu]], aż luka zostanie wypełniona. Nie da się wykonać drugiej transakcji przed pierwszą i właśnie o to chodzi, bo dzięki temu historia konta jest ścisłą sekwencją, a przechwyconej podpisanej transakcji nie da się wysłać ponownie (replay)."
        ]
      },
      {
        heading: "Zastępowanie, luki i zablokowane transakcje",
        paragraphs: [
          "Skoro nonce wyznacza miejsce w kolejce, żeby anulować albo przyspieszyć transakcję pending, trzeba podpisać inną transakcję z tym samym nonce i wyższą opłatą. Mempoole wymagają realnej podwyżki, a nie symbolicznej; klienci zwykle żądają co najmniej 10 procent więcej w obu polach, [[eip-1559|maxFeePerGas i maxPriorityFeePerGas]], a w przeciwnym razie odpowiadają „replacement transaction underpriced”. Anulowanie to ten sam ruch, tylko payloadem jest pusty przelew do samego siebie.",
          "Jedna transakcja z za niską opłatą blokuje więc wszystkie kolejne z tego samego konta i to zwykle ona jest przyczyną zatoru, który wygląda na problem z węzłem. Dlatego też [[transaction-relayer|usługa, która wysyła z jednego adresu]], robi to po kolei: dwa workery, które oba odczytają następny nonce i oba podpiszą transakcję, skończą z jedną transakcją w bloku i drugą odrzuconą z błędem „nonce too low”, albo, co gorsza, z dwiema transakcjami konkurującymi o to samo miejsce."
        ]
      },
      {
        heading: "Nonce kontraktów a RPC",
        paragraphs: [
          "Kontrakty też mają nonce, ale liczą wdrożenia, a nie transakcje: nonce kontraktu rośnie przy każdym wykonanym przez niego `CREATE` i zaczyna się od 1 w chwili utworzenia kontraktu, co zapewnia unikalność [[address|adresów z CREATE]]. [[eip-7702|Autoryzacje set code]] także zawierają i zużywają nonce konta, które je podpisuje.",
          "Nonce zwykle odczytuje się przez [[eth-get-transaction-count|eth_getTransactionCount]], a [[eth-get-proof|eth_getProof]] też go zwraca, razem z dowodem. Z `latest` metoda zwraca liczbę transakcji włączonych do bloków, czyli następny nonce do użycia; z `pending` liczy też to, co węzeł trzyma we własnym mempoolu. Dwa węzły mogą podać różne odpowiedzi dla `pending`, więc portfel, który rotuje między providerami, powinien sam śledzić swój nonce, a odpowiedź węzła traktować tylko jako dolną granicę. Niezwiązane z tym pole `nonce` w [[block-header|nagłówku bloku]] to pozostałość po proof of work i od czasu [[the-merge|Merge]] zawsze wynosi `0x0000000000000000`."
        ]
      }
    ],
    pitfalls: [
      "Odczyt `eth_getTransactionCount` z `latest`, gdy własne transakcje wciąż czekają jako pending, przez co ponownie używa się nonce, który jest już zajęty.",
      "Zakładanie, że nieudana transakcja zwalnia nonce; transakcja z revertem i tak trafia do bloku i zużywa swój nonce.",
      "Podnoszenie przy zastępowaniu tylko `maxFeePerGas`; większość mempooli wymaga podniesienia o ten sam procent także priority fee.",
      "Równoległe wysyłanie z jednego adresu przez kilka workerów albo providerów, co zamiast przepustowości daje luki i odrzucenia „nonce too low”."
    ]
  },
  gas: {
    title: "Gas",
    aliases: ["limit gasu", "gas limit", "gasUsed", "out of gas", "intrinsic gas", "21000", "naliczanie gasu"],
    summary: "Gas to jednostka, w której mierzy się pracę w [[evm|EVM]]: każdy opcode, każdy bajt calldata i każda zmiana stanu ma stały koszt w gasie, a [[transaction|transakcja]] może zużyć najwyżej tyle, ile wynosi podpisany przez nadawcę limit `gas`.",
    sections: [
      {
        heading: "Co kosztuje gas",
        paragraphs: [
          "Każda transakcja płaci 21000 gasu jako intrinsic gas (stały koszt samej transakcji), zanim uruchomi się jakikolwiek kod, plus 32000, jeśli wdraża [[smart-contract|smart kontrakt]], plus opłatę za calldata: historycznie 16 gasu za każdy niezerowy bajt i 4 za zerowy, a od Pectra obowiązuje też cena minimalna z EIP-7623, przez którą transakcje z dużą ilością danych kosztują więcej. Potem wykonanie nalicza gas za każdy opcode. Arytmetyka to kilka jednostek gasu, odczyt slotu storage, którego transakcja jeszcze nie dotykała, kosztuje 2100, a ponowny odczyt 100, pierwsze odwołanie do nowego [[account|konta]] 2600, a zapis do slotu ze zera na wartość niezerową 20000. [[gas-refunds|Czyszczenie storage daje refund]] (zwrot gasu), ale EIP-3529 ogranicza łączny refund do jednej piątej gasu zużytego przez transakcję.",
          "Ten cennik nie jest wymyślany przez każdego klienta osobno; to część konsensusu. Gdyby dwaj klienci naliczali inny gas za ten sam blok, policzyliby inne `gasUsed` i inny [[state-root|state root]], dlatego koszty gasu zmieniają się tylko przy [[hardfork|aktualizacji sieci]]."
        ]
      },
      {
        heading: "Limit, zużycie i brak gasu",
        paragraphs: [
          "Pole `gas` w transakcji to limit, a nie cena i nie prognoza. Niewykorzystany gas wraca, więc ustawienie go wyżej niż trzeba samo w sobie nic nie kosztuje, ale rezerwuje miejsce w ramach [[block-header|limitu gasu bloku]], o którym głosują walidatorzy i który ogranicza sumę gasu wszystkich transakcji w [[block|bloku]]. Od Fusaka EIP-7825 ogranicza też własny limit każdej transakcji do 16 777 216 (2 do potęgi 24) gasu, znacznie poniżej limitu bloku: mempool odrzuca transakcję powyżej tej wartości, a blok, który ją zawiera, jest nieważny. EIP-8037 z Glamsterdam ma zawęzić ten limit do gasu wykonania, żeby gas za tworzenie stanu mógł go przekroczyć. Jeśli wykonanie potrzebuje więcej, niż wynosi limit, transakcja kończy się błędem out of gas: pobierany jest cały limit, wszystkie zmiany stanu są cofane, a [[transaction-receipt|receipt]] pokazuje `status` `0x0` i `gasUsed` równe limitowi.",
          "W trakcie wykonania wywołujący nie może przekazać całego pozostałego gasu do wywołania podrzędnego. Reguła z EIP-150 zatrzymuje jedną 64. część, więc wywołanie dostaje najwyżej 63/64 tego, co zostało. Dlatego głęboko zagnieżdżone wywołania mogą wyczerpać gas, nawet gdy transakcja jeszcze go ma, i dlatego kontrakt, który sprawdza wynik wywołania podrzędnego, może taki brak gasu przetrwać."
        ]
      },
      {
        heading: "Gas w RPC",
        paragraphs: [
          "[[eth-estimate-gas|eth_estimateGas]] szuka najmniejszego limitu, przy którym wywołanie udaje się na bieżącym stanie, a [[eth-call|eth_call]] działa z limitem gasu ustawionym przez operatora (gas cap), a nie z tym, co zapłaciłby nadawca. W Geth `--rpc.gascap` domyślnie wynosi 50 milionów, co pozwala wywołaniu zużyć znacznie więcej gasu, niż od Fusaka może zużyć jakakolwiek transakcja, a endpoint z niższym limitem może odrzucić wywołanie, które w bloku przeszłoby bez problemu. Sama opłata to gas pomnożony przez cenę w [[wei|wei]], a to osobne pytanie, na które odpowiada [[eip-1559|rynek opłat]]; receipt podaje obie połowy jako `gasUsed` i `effectiveGasPrice`. Dane blobów mierzy druga, niezależna jednostka, blob gas, z własnym limitem i własną ceną."
        ]
      }
    ],
    pitfalls: [
      "Kopiowanie `gas` ze starej transakcji; to samo wywołanie może kosztować więcej po aktualizacji, która zmieniła cenę opcode'u, albo gdy slot storage zmienił się z zera na wartość niezerową.",
      "Traktowanie błędu out of gas jako darmowego; pobierany jest cały limit, choć nic nie zostało zastosowane.",
      "Ustawianie limitu powyżej 16 777 216, co od Fusaka jest nieważne za sprawą EIP-7825, więc każdy mempool odrzuca taką transakcję bez względu na oferowaną opłatę.",
      "Zakładanie, że skoro `eth_call` się powiodło, to transakcja też się powiedzie; wywołanie działało pod gas cap węzła, a nie pod limitem nadawcy."
    ]
  },
  "eip-1559": {
    title: "Rynek opłat EIP-1559",
    aliases: [
      "base fee",
      "baseFeePerGas",
      "maxFeePerGas",
      "maxPriorityFeePerGas",
      "napiwek",
      "tip",
      "priority fee",
      "spalanie opłat",
      "burn",
      "1559",
      "opłaty eip-1559"
    ],
    summary: "EIP-1559 zastąpił jedną cenę gasu trzema wartościami: ustalaną przez protokół `baseFeePerGas`, którą spala każdy [[block|blok]], napiwkiem (priority fee) `maxPriorityFeePerGas` dla odbiorcy opłat bloku (fee recipient) oraz pułapem `maxFeePerGas`, który podpisuje nadawca.",
    sections: [
      {
        heading: "Jak zmienia się base fee",
        paragraphs: [
          "Każdy nagłówek bloku zawiera `baseFeePerGas`, obliczoną wyłącznie na podstawie bloku nadrzędnego: jeśli ten zużył dokładnie połowę swojego limitu [[gas|gasu]], czyli tyle, ile wynosi cel, opłata się nie zmienia, a w przeciwnym razie zmienia się o najwyżej 12,5 procent na blok w kierunku, który przybliża zużycie do celu. Reguła jest deterministyczna, więc każdy, kto ma nagłówek, może dokładnie obliczyć base fee następnego bloku. Na tym opierają się estymatory opłat i [[rollup|rollupy]]. Base fee jest spalana, a nie komukolwiek wypłacana, więc proposer nic nie zyskuje na jej zawyżaniu.",
          "Blok co dwanaście sekund i zmiana o 12,5 procent to powolne narzędzie. Wygładza popyt w skali minut, a nie wewnątrz bloku; w obrębie jednego bloku o kolejności decyduje wyłącznie napiwek i to, co builder dostał prywatnie."
        ]
      },
      {
        heading: "Ile naprawdę płaci nadawca",
        paragraphs: [
          "W [[transaction-types|transakcji typu 0x2]] nadawca podpisuje dwie liczby. `maxFeePerGas` to najwyższa łączna kwota, jaką zapłaci za jednostkę gasu, a `maxPriorityFeePerGas` to najwyższa kwota, jaką ponad base fee odda odbiorcy opłat. Ostateczna cena to `baseFeePerGas + min(maxPriorityFeePerGas, maxFeePerGas - baseFee)` i pojawia się w [[transaction-receipt|receipcie]] jako `effectiveGasPrice`. Nadwyżka podpisana ponad tę cenę po prostu nie jest pobierana, dlatego hojnie ustawione `maxFeePerGas` to tanie ubezpieczenie, a nie przepłacanie.",
          "Transakcja, której `maxFeePerGas` jest niższe od bieżącej base fee, nie jest nieważna. Po prostu nie da się jej włączyć do bloku, dopóki base fee nie spadnie do jej poziomu. Transakcje legacy nadal działają: pojedyncze pole `gasPrice` jest traktowane jednocześnie jako pułap i jako napiwek, więc taka transakcja po cichu płaci base fee, a resztę oddaje jako napiwek."
        ]
      },
      {
        heading: "Szacowanie opłat przez RPC",
        paragraphs: [
          "Bieżącą base fee odczytuje się z najnowszego [[block-header|nagłówka]] albo z [[eth-fee-history|eth_feeHistory]], które zwraca też base fee następnego bloku, `gasUsedRatio` i percentyle napiwków z wybranego okna bloków. O sugerowany napiwek można zapytać [[eth-gas-price|eth_maxPriorityFeePerGas]] albo wziąć percentyl z tego samego wywołania. Popularny przepis to napiwek od jednego do dwóch gwei plus `maxFeePerGas` mniej więcej dwukrotnie wyższe od base fee, co wytrzymuje kilka pełnych bloków z rzędu. `eth_gasPrice` nadal istnieje i dla starszego kodu zwraca base fee plus sugerowany napiwek jako jedną liczbę.",
          "Dane [[blob|blobów]] mają własny, równoległy rynek o tym samym kształcie: `excessBlobGas` w nagłówku wyznacza base fee blobów, która również jest spalana, a podaje ją `eth_blobBaseFee`."
        ]
      }
    ],
    example: {
      title: "Ile płaci transakcja przy danej base fee",
      note: "Napiwek jest tym, co zostaje pod pułapem, więc zbyt ciasne `maxFeePerGas` obcina napiwek na długo, zanim doprowadzi do odrzucenia transakcji."
    },
    pitfalls: [
      "Ustawianie `maxFeePerGas` równego bieżącej base fee; wystarczy jeden blok wzrostu, by transakcji nie dało się włączyć do bloku, dopóki popyt nie spadnie.",
      "Odczytywanie `effectiveGasPrice` tak, jakby od nadawcy pobrano `maxFeePerGas`; różnicy nigdy się nie pobiera.",
      "Szacowanie opłat wyłącznie na podstawie `eth_gasPrice` w sieci, w której dominują napiwki, zamiast osobnego odczytu base fee i napiwku.",
      "Zakładanie, że spalona base fee trafia do proposera, i tłumaczenie przychodów walidatora liczbą, która została zniszczona."
    ]
  },
  "access-list": {
    title: "Access list",
    aliases: ["EIP-2930", "accessList", "access lists", "warm", "cold", "ciepły dostęp", "zimny dostęp", "EIP-2929", "createAccessList"],
    summary: "Access list to opcjonalne pole `accessList` [[transaction-types|transakcji typowanej]], które z góry wymienia adresy i klucze storage. Płaci się za nie obniżoną cenę, a ich pierwsze użycie w trakcie wykonania jest rozliczane jak dostęp ciepły (warm).",
    sections: [
      {
        heading: "Dostęp ciepły i zimny",
        paragraphs: [
          "EIP-2929 uzależnił koszt dostępu do stanu od tego, czy [[evm|EVM]] odwołała się do niego już wcześniej w tej samej [[transaction|transakcji]]. Pierwszy, zimny (cold) odczyt slotu storage kosztuje 2100 [[gas|gasu]], a każdy kolejny, ciepły (warm), 100; pierwsze odwołanie do [[account|konta]], przy odczycie salda albo wywołaniu, kosztuje 2600, a kolejne 100. Różnica opłaca pracę dyskową, którą klient wykonuje, by pobrać stan, którego nie ma w pamięci.",
          "EIP-2930 pozwala nadawcy zapłacić z góry: 2400 gasu za każdy wymieniony adres i 1900 gasu za każdy wymieniony klucz storage, po czym te wpisy są ciepłe od początku transakcji. Rachunek jest celowo ciasny. Wymieniony klucz storage kosztuje 1900 plus 100 przy pierwszym użyciu, co jest tańsze od 2100 dokładnie o 100 gasu, a wymieniony adres kosztuje 2400 plus 100 wobec 2600, czyli znowu o 100 mniej. Lista zwraca się tylko wtedy, gdy dostęp faktycznie nastąpi."
        ]
      },
      {
        heading: "Jak ją zbudować i wysłać",
        paragraphs: [
          "[[eth-create-access-list|eth_createAccessList]] wykonuje wywołanie i zwraca adresy i sloty, do których się ono odwołało, razem z `gasUsed`, jakie wychodzi po dołączeniu listy. Klienci pomijają wpisy, które z definicji są ciepłe, takie jak nadawca, odbiorca i [[precompiles|precompile'y]]. Pole występuje w każdej [[transaction-types|transakcji typowanej]] od typu `0x1` wzwyż, więc zwykła transakcja EIP-1559 też może je mieć; typ `0x1` istnieje głównie dlatego, że access listy wprowadzono przed dynamicznymi opłatami.",
          "W praktyce oszczędność gasu jest niewielka, a sama lista kosztuje własne bajty calldata, więc aplikacje używają jej wybiórczo: w kontraktach, które skaczą po wielu zimnych kontach, w ruchu [[rollup|rollupów]], gdzie liczy się przewidywalność, i w transakcjach budowanych przez symulatory, które już znają zbiór odwołań. Lista jest też wskazówką do planowania wykonania, bo klient, który ją czyta, wie, jakiego stanu transakcja będzie potrzebować, zanim ją uruchomi."
        ]
      },
      {
        heading: "Czego nie robi",
        paragraphs: [
          "Access list niczego nie autoryzuje i niczego nie ogranicza. Transakcja może odwołać się do stanu spoza listy i po prostu zapłaci za niego zimną cenę; z kolei wpisanie stanu, do którego nigdy się nie odwoła, to czysta strata. Lista nie jest granicą bezpieczeństwa ani blokadą (lock), więc dwie transakcje z tym samym slotem na liście i tak wykonują się w kolejności z bloku, jedna po drugiej."
        ]
      }
    ],
    pitfalls: [
      "Dołączanie access listy wygenerowanej na starym stanie; jeśli zbiór odwołań się zmienił, za każdy nieaktualny wpis płaci się 2400 albo 1900 na darmo.",
      "Oczekiwanie dużej oszczędności; w najlepszym razie to 100 gasu na wpis, minus koszt calldata potrzebnego, by ten wpis przenieść.",
      "Traktowanie listy jak allowlisty stanu, do którego transakcja może się odwołać, choć nią nie jest.",
      "Wywoływanie `eth_createAccessList` przy każdym wysłaniu; to pełna symulacja na transakcję dla oszczędności, która często jest mniejsza niż narzut samej estymacji."
    ]
  },
  account: {
    title: "Konto",
    aliases: ["EOA", "externally owned account", "konto kontraktu", "saldo", "codeHash", "storageRoot"],
    summary: "Konto to wpis w [[state|stanie globalnym]], którego kluczem jest 20-bajtowy [[address|adres]]. Wpis ma dokładnie cztery pola: `nonce`, `balance`, `storageRoot` i `codeHash`. O tym, czy jest to smart kontrakt, czy konto EOA (externally owned account), decyduje jego kod.",
    sections: [
      {
        heading: "Dwa rodzaje, jedna struktura",
        paragraphs: [
          "Kontem EOA steruje klucz prywatny: ma ono [[nonce|nonce]] i `balance` w [[wei|wei]], ale nie ma storage ani kodu, więc jego `codeHash` to hash [[keccak-256|Keccak-256]] pustego ciągu, a `storageRoot` to korzeń pustego trie. Konto [[smart-contract|kontraktu]] ma te same cztery pola, z rzeczywistymi wartościami w dwóch ostatnich, i działa tylko wtedy, gdy ktoś je wywoła. Całe rozróżnienie sprowadza się do jednego pytania: czy pod tym adresem jest kod? Nawet tę granicę zaciera [[eip-7702|EIP-7702]], bo pozwala kontu EOA opublikować jako swój kod delegation designator (znacznik delegacji).",
          "Nic więcej nie jest zapisywane dla konta. Nie ma pola właściciela, czasu utworzenia ani listy posiadanych tokenów. Saldo tokena ERC-20 w ogóle nie jest częścią konta; to wartość w [[contract-storage|storage kontraktu]] tego tokena, dlatego żeby wylistować, co posiada dany adres, potrzebny jest [[indexer|indekser]], a nie jedno wywołanie RPC."
        ]
      },
      {
        heading: "Gdzie są przechowywane konta",
        paragraphs: [
          "Konta to liście trie stanu: kluczem jest hash Keccak-256 adresu, a wartością cztery pola zapisane jako lista [[rlp|RLP]]. Dlatego [[state-root|state root]] w każdym [[block-header|nagłówku]] jest commitmentem do wszystkich kont naraz i dlatego [[eth-get-proof|eth_getProof]] pozwala udowodnić saldo komuś, kto ufa tylko nagłówkowi.",
          "Adres jest poprawnym odbiorcą niezależnie od tego, czy stan ma dla niego wpis; wpis pojawia się, gdy adres po raz pierwszy dostanie środki albo gdy coś zostanie pod nim wdrożone. Odczyt konta, którego nic nigdy nie dotknęło, nie jest [[rpc-errors|błędem]]: saldo wynosi `0x0`, nonce `0x0`, a kod `0x`."
        ]
      },
      {
        heading: "Odczyt pól konta przez RPC",
        paragraphs: [
          "W powszechnym użyciu nie ma metody `eth_getAccount`; każde pole ma własną metodę. [[eth-get-balance|eth_getBalance]] zwraca `balance`, [[eth-get-transaction-count|eth_getTransactionCount]] zwraca nonce, [[eth-get-code|eth_getCode]] zwraca sam kod, a nie jego hash, a [[eth-get-storage-at|eth_getStorageAt]] zwraca jeden slot storage. Wszystkie przyjmują [[block-tag|parametr bloku]], więc wszystkie wymagają, żeby stan z tego bloku nadal był dostępny na węźle.",
          "Wyjątkiem jest [[eth-get-proof|eth_getProof]], który zwraca całe konto naraz, jako `balance`, `nonce`, `codeHash` i `storageHash`, razem z trie node'ami tworzącymi dowód, które pozwalają te wartości zweryfikować. To najtańszy sposób na spójny snapshot jednego konta, bo cztery osobne wywołania na `latest` mogą trafić po dwóch stronach nowego bloku."
        ]
      }
    ],
    pitfalls: [
      "Uznanie adresu za konto EOA, bo `eth_getCode` na `latest` daje `0x`; kontrakt może po prostu nie być jeszcze wdrożony pod tym adresem, a konto z delegacją zwraca 23 bajty.",
      "Szukanie salda tokena w `eth_getBalance`; ta metoda zawsze podaje wyłącznie ether w wei.",
      "Zakładanie, że konto z zerowym saldem nie istnieje; istnienie konta i jego saldo nie mają ze sobą związku.",
      "Odczyt salda, nonce i kodu trzema wywołaniami na `latest` i traktowanie wyników jak jednego snapshotu konta."
    ]
  },
  address: {
    title: "Adres",
    aliases: ["adres 0x", "EIP-55", "suma kontrolna", "checksum", "CREATE2", "adres zerowy", "20 bajtów"],
    summary: "Adres to 20-bajtowy identyfikator [[account|konta]]. Dla konta sterowanego kluczem to ostatnie 20 bajtów hasha [[keccak-256|Keccak-256]] jego klucza publicznego, a dla smart kontraktu wartość wyliczana z adresu twórcy oraz z [[nonce|nonce]] albo z wartości salt.",
    sections: [
      {
        heading: "Skąd biorą się adresy",
        paragraphs: [
          "Adres konta EOA to ostatnie 20 bajtów hasha Keccak-256 jego nieskompresowanego klucza publicznego, z którego najpierw usuwa się wiodący bajt `0x04`. Nikt go nigdzie nie rejestruje, więc każdy z 2 do potęgi 160 adresów jest poprawny i może otrzymać ether, zanim ktokolwiek będzie miał do niego klucz.",
          "Kontrakt wdrożony przez `CREATE` dostaje adres `keccak256(rlp([sender, nonce]))` obcięty do 20 bajtów, dlatego n-ty kontrakt danego konta wdrażającego ma przewidywalny adres. `CREATE2` używa zamiast tego `keccak256(0xff ++ sender ++ salt ++ keccak256(initCode))`, więc adres zależy od kodu, a nie od kolejności. To umożliwia [[erc-6492|counterfactual deployment]], czyli wdrożenie pod adres znany z góry: aplikacja może obliczyć adres portfela, pozwolić użytkownikom go zasilić, a [[smart-contract|kontrakt]] wdrożyć tam później."
        ]
      },
      {
        heading: "Sumy kontrolne i formatowanie",
        paragraphs: [
          "W JSON-RPC adresy występują jako 20-bajtowe [[hex-encoding|DATA]], czyli `0x` i dokładnie 40 znaków hex, a klienci zwracają je małymi literami. EIP-55 dodaje opcjonalną sumę kontrolną: wielkość niektórych liter hex zależy od hasha Keccak wersji zapisanej małymi literami. Dlatego `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` i jego bliźniak zapisany samymi małymi literami to ten sam adres, ale literówkę w ciągu z mieszaną wielkością liter da się wykryć. Portfele sprawdzają sumę kontrolną; węzłom jest to obojętne.",
          "Adres zerowy, `0x0000000000000000000000000000000000000000`, to zwykły adres, do którego nikt nie zna klucza. To konwencja, a nie funkcja protokołu: tokeny ERC-20 używają go jako drugiej strony w [[event-log|eventach]] mintowania i spalania, a wdrożenie kontraktu rozpoznaje się po `to` równym `null`, nie po adresie zerowym."
        ]
      },
      {
        heading: "Adresy w wywołaniach RPC",
        paragraphs: [
          "Parametry z adresami nie rozróżniają wielkości liter, a żeby adresy porównać, trzeba najpierw sprowadzić je do jednej wielkości liter. To źródło wielu cichych pomyłek, przez które filtry i cache po prostu niczego nie znajdują. W [[eth-get-logs|eth_getLogs]] pole `address` przyjmuje jeden adres albo ich listę, ale gdy adres jest indeksowanym argumentem eventu, trafia do 32-bajtowego topicu, dopełniony z lewej dwunastoma bajtami zerowymi, i wartość w filtrze trzeba dopełnić tak samo.",
          "Nazwy [[ens|ENS]] nie są adresami i nigdy nie docierają do węzła jako nazwy: biblioteka najpierw rozwiązuje nazwę własnym wywołaniem [[eth-call|eth_call]], a dopiero potem wysyła 20 bajtów. Nic w JSON-RPC warstwy wykonawczej nie przyjmuje `vitalik.eth`."
        ]
      }
    ],
    pitfalls: [
      "Porównywanie adresów jako surowych stringów; wersja z sumą kontrolną i wersja zapisana małymi literami tego samego adresu nie są równe jako stringi.",
      "Używanie adresu bezpośrednio jako wartości filtra `topics` bez dopełnienia go z lewej do 32 bajtów; część klientów odrzuca taki topic jako mający złą długość, a inni po prostu nigdy go nie dopasują.",
      "Wysyłanie tokenów na adres zerowy, żeby je spalić, gdy token nie traktuje tego adresu w szczególny sposób; wartość po prostu utknie pod adresem, którego nikt nie kontroluje.",
      "Zakładanie, że adres z `CREATE` będzie taki sam w innym łańcuchu albo przy ponownej próbie; zależy od nonce konta wdrażającego w danej chwili."
    ]
  },
  evm: {
    title: "Maszyna wirtualna Ethereum (EVM)",
    aliases: ["EVM", "Ethereum Virtual Machine", "bytecode", "opkody", "opcodes", "maszyna stosowa", "DELEGATECALL", "message call"],
    summary: "EVM to maszyna stosowa, którą każdy [[execution-client|klient wykonawczy]] implementuje identycznie: wykonuje bytecode kontraktów na 256-bitowych słowach, nalicza [[gas|gas]] za każdy krok i jako jedyna może zmieniać [[state|stan]].",
    sections: [
      {
        heading: "Maszyna",
        paragraphs: [
          "EVM ma stos o pojemności najwyżej 1024 słów, każde o szerokości 256 bitów, oraz trzy miejsca na dane. Pamięć (memory) to tablica bajtów, która istnieje przez jedno wywołanie i drożeje w miarę wzrostu. [[contract-storage|Storage]] to trwała mapa z 256-bitowych kluczy na 256-bitowe wartości, która należy do [[smart-contract|smart kontraktu]] i przetrwa między transakcjami. Calldata to dane wejściowe tylko do odczytu, które podał wywołujący. [[transient-storage|Transient storage]], dodane w Dencun przez EIP-1153, działa jak storage, ale jest kasowane, gdy kończy się [[transaction|transakcja]].",
          "Wykonanie jest deterministyczne z samej konstrukcji. Nie ma zegara, systemu plików ani dostępu do sieci; jedyne informacje z zewnątrz to kontekst bloku (numer, timestamp, `PREVRANDAO`, base fee), calldata i sam stan. Dzięki temu tysiące maszyn mogą odtworzyć ten sam [[block|blok]] i zgodzić się co do wynikowego [[state-root|state root]]."
        ]
      },
      {
        heading: "Wywołania, ramki i błędy",
        paragraphs: [
          "Kontrakt sięga do innego kontraktu przez message call (wywołanie między kontraktami). `CALL` uruchamia kod wywoływanego kontraktu w nowej ramce z własnym stosem, pamięcią i kontekstem storage. `DELEGATECALL` uruchamia kod wywoływanego kontraktu, ale zachowuje storage, [[address|adres]] i wartość wywołującego, i właśnie to umożliwia [[proxy-contract|kontrakty proxy]] oraz systemy z możliwością aktualizacji. `STATICCALL` zabrania zmian stanu, więc funkcja view nie może po cichu niczego zapisać. Ramki można zagnieżdżać do głębokości 1024, a wywołujący może przekazać najwyżej 63/64 pozostałego gasu.",
          "Ramka kończy się na jeden z trzech sposobów: zwraca dane, kończy się [[revert|revertem]] i oddaje dane revertu, cofając własne zmiany, albo wyczerpuje gas i zużywa wszystko, co dostała. Revert w wewnętrznej ramce nie musi oznaczać niepowodzenia transakcji; wywołujący widzi flagę błędu i może działać dalej, dlatego [[transaction-receipt|receipt]] może pokazywać `status` `0x1` dla transakcji, w której są nieudane wywołania."
        ]
      },
      {
        heading: "Uruchamianie EVM przez RPC",
        paragraphs: [
          "[[eth-call|eth_call]] wykonuje message call na stanie z wybranego bloku i niczego z wyniku nie zapisuje. Buduje wiarygodny kontekst bloku, pomija sprawdzanie podpisu i nonce i nie wymaga, żeby wywołujący miał saldo, więc wywołanie z adresu zerowego działa. Ta swoboda sprawia, że jest to standardowa ścieżka odczytu, i z jej powodu sukces w tym wywołaniu nie dowodzi, że transakcja się powiedzie.",
          "[[eth-estimate-gas|eth_estimateGas]] wielokrotnie uruchamia tę samą maszynę, żeby znaleźć działający limit, [[state-override|state overrides]] pozwalają udawać, że konto ma inny kod albo saldo, [[eth-simulate|eth_simulateV1]] łączy wywołania w łańcuch przez kilka symulowanych bloków, a przestrzenie nazw [[debug-api|debug_]] i [[trace-api|trace_]] wykonują kod ponownie, rejestrując jego przebieg, co jest jedynym sposobem, żeby zobaczyć wywołania wewnętrzne. Wszystkie potrzebują stanu z wybranego bloku, więc endpoint, który usunął go przez pruning, odmówi."
        ]
      },
      {
        heading: "Jedna specyfikacja, kilka implementacji",
        paragraphs: [
          "Każdy klient ma własną EVM: interpreter [[geth|Geth]] napisany w Go, implementację [[nethermind|Nethermind]] w C#, revm w [[reth|Reth]] i inne, wszystkie sprawdzane na wspólnym zestawie przypadków ze specyfikacji wykonania (execution-spec tests). Zachowanie musi się zgadzać co do jednostki gasu, bo jeden źle wyceniony opcode daje inny state root i dzieli sieć wzdłuż granic między klientami. Na tym właśnie opiera się cały argument za [[client-diversity|różnorodnością klientów]]."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że skoro `eth_call` się powiodło, to transakcja też się powiedzie; wywołanie pominęło sprawdzanie nonce, salda i podpisu i działało pod limitem gasu ustawionym przez węzeł (gas cap).",
      "Traktowanie `DELEGATECALL` jak zwykłego wywołania; kod wywoływanego kontraktu zapisuje storage wywołującego, więc zły adres implementacji pociąga za sobą całe proxy.",
      "Szukanie wywołań wewnętrznych w receipcie; pokazuje je tylko trace, bo nic w nich nie jest danymi protokołu.",
      "Traktowanie `PREVRANDAO` jako tajnego źródła losowości; proposer zna tę wartość, zanim zbuduje blok."
    ]
  },
  "smart-contract": {
    title: "Smart kontrakt",
    aliases: ["kontrakt", "smart contract", "bytecode", "wdrożenie kontraktu", "konstruktor", "proxy", "getCode"],
    summary: "Smart kontrakt to bytecode zapisany pod [[address|adresem]] razem z własnym [[contract-storage|storage]]. Nie ma kluczy, nigdy nie działa sam z siebie i uruchamia się tylko wtedy, gdy wywoła go [[transaction|transakcja]] albo inny kontrakt.",
    sections: [
      {
        heading: "Jak kod trafia do łańcucha",
        paragraphs: [
          "Wdrożenie to zwykła transakcja z `to` ustawionym na `null` i init code (kodem inicjującym) w `input`. [[evm|EVM]] wykonuje ten init code, konstruktor zapisuje w [[contract-storage|storage]] dowolne wartości początkowe, a to, co init code zwróci, staje się runtime bytecode, który faktycznie zostaje zapisany. Te dwa kody się różnią, dlatego bajty wysłane w transakcji to nie te same bajty, które zwraca [[eth-get-code|eth_getCode]]. Nowy [[address|adres]] jest wyliczany z nadawcy i jego [[nonce|nonce]] albo, przy `CREATE2`, z wartości salt, a [[transaction-receipt|receipt]] podaje go w `contractAddress`.",
          "Zapisany kod jest niezmienny. Systemy, które trzeba aktualizować, stawiają pod stałym adresem [[proxy-contract|proxy]], które przez `DELEGATECALL` wywołuje implementację, a jej adres trzyma w ustalonym slocie storage; storage zostaje przy proxy, a logikę można podmienić. `SELFDESTRUCT` też już nie usuwa kodu: od EIP-6780 z Dencun czyści tylko konto utworzone w tej samej transakcji, a w pozostałych przypadkach jedynie przekazuje dalej saldo."
        ]
      },
      {
        heading: "Rozmowa z kontraktem przez RPC",
        paragraphs: [
          "Odczyt to [[eth-call|eth_call]] z calldata w formacie [[abi|ABI]] i [[block-tag|parametrem bloku]]; węzeł wykonuje funkcję i zwraca zakodowany wynik, nie dotykając łańcucha. Zapis to podpisanie transakcji na ten sam adres z takim samym rodzajem calldata i czekanie na receipt. Obserwowanie to [[event-log|logi]]: kontrakty emitują je opcode'ami od `LOG0` do `LOG4`, a [[eth-get-logs|eth_getLogs]] to sposób, w jaki wszystko poza łańcuchem dowiaduje się, co się stało. Kontrakty nie mogą czytać własnych logów, dlatego stan, którego kontrakt potrzebuje, musi być w storage, a logi istnieją wyłącznie dla świata zewnętrznego."
        ]
      },
      {
        heading: "Czego węzeł nie wie",
        paragraphs: [
          "Łańcuch przechowuje bytecode, a nie znaczenie. Żadna metoda RPC nie zwraca listy funkcji kontraktu, nazw jego zmiennych ani kodu źródłowego: ABI pochodzi od dewelopera albo z [[block-explorer|eksploratora bloków]], który zweryfikował kod źródłowy względem wdrożonego bytecode. To samo dotyczy układu storage, więc żeby odczytać zmienną przez [[eth-get-storage-at|eth_getStorageAt]], trzeba samemu wyliczyć slot na podstawie kodu źródłowego.",
          "Nazw też nie ma w łańcuchu. Nazwa [[ens|ENS]], symbol tokena i tożsamość interfejsu to dane, które wywołujący ustala, wywołując inne kontrakty. Węzeł odpowiada bajtami; każda etykieta wokół nich to wiedza aplikacji."
        ]
      }
    ],
    pitfalls: [
      "Porównywanie wdrożonego bytecode z tym, co kompilator generuje do wdrożenia (creation bytecode); zapisywana jest tylko część runtime, a metadane na końcu zależą od ustawień kompilatora.",
      "Uznanie adresu za bezpieczny, bo `eth_getCode` zwraca bajty; zachowanie proxy zależy od implementacji, na którą akurat wskazuje jego storage.",
      "Zakładanie, że funkcja `view` jest darmowa; jako `eth_call` nic nie kosztuje, ale gdy wywołuje ją kontrakt w łańcuchu, kosztuje gas.",
      "Oczekiwanie, że kontrakt przeczyta własne wcześniejsze [[event-log|eventy]]; z punktu widzenia EVM logi są tylko do zapisu."
    ]
  },
  "contract-storage": {
    title: "Układ storage kontraktu",
    aliases: ["slot storage", "storage slot", "slot 0", "slot mappingu", "spakowane zmienne", "getStorageAt", "storage layout", "układ storage"],
    summary: "Storage kontraktu to mapa 2 do potęgi 256 slotów po 32 bajty, a Solidity przypisuje zmienne do slotów według stałych reguł, więc odczyt przez [[eth-get-storage-at|eth_getStorageAt]] wymaga samodzielnego wyliczenia numeru slotu.",
    sections: [
      {
        heading: "Zmienne o stałym rozmiarze i pakowanie",
        paragraphs: [
          "Kompilator numeruje zmienne stanu o statycznym rozmiarze od slotu `0` w kolejności deklaracji. Zmienne mniejsze niż 32 bajty dzielą slot, jeśli się w nim mieszczą, i wypełniają go od strony mniej znaczących bajtów, więc `uint128` i następujący po nim drugi `uint128` zajmują razem jeden slot, a odczyt zwraca obie wartości sklejone ze sobą. Zmienna, która się nie mieści, zaczyna nowy slot, a zmiana kolejności deklaracji zmienia numery wszystkich dalszych slotów. Stałe i wartości `immutable` w ogóle nie trafiają do storage, bo kompilator wpisuje je w bytecode [[smart-contract|kontraktu]].",
          "Dziedziczone kontrakty kontynuują tę samą numerację, najpierw rodzice, dlatego wzorce proxy rezerwują stałe sloty daleko w przestrzeni slotów, zamiast polegać na kolejności deklaracji. Wiążącą odpowiedź dla konkretnego kontraktu daje układ storage (storage layout) wygenerowany przez kompilator, a nie zgadywanie na podstawie kodu źródłowego."
        ]
      },
      {
        heading: "Mappingi, tablice i stringi",
        paragraphs: [
          "Slot `p`, w którym zadeklarowano mapping, sam niczego nie przechowuje. W Solidity wartość dla klucza `k` leży pod `keccak256(pad32(k) ++ pad32(p))`, przy czym oba operandy są dopełnione do 32 bajtów, natomiast Vyper hashuje najpierw slot, jak widać przy [[storage-slot-discovery|znajdowaniu slotów storage]]; zagnieżdżony mapping stosuje tę regułę ponownie, z wewnętrznym slotem jako nowym `p`. Tablica dynamiczna trzyma swoją długość w slocie `p`, a elementy kolejno od `keccak256(pad32(p))`. Wartość `string` albo `bytes` o długości co najwyżej 31 bajtów leży bezpośrednio w swoim slocie, z podwojoną długością w ostatnim bajcie; dłuższe wartości trzymają tam podwojoną długość plus jeden, a dane pod `keccak256(pad32(p))`.",
          "Ponieważ te pozycje pochodzą z [[keccak-256|Keccak-256]], dane w storage są rozproszone, a nie ułożone ciągiem. Dlatego też iterowanie po mappingu on-chain jest niemożliwe i dlatego istnieją [[indexer|indeksery]]."
        ]
      },
      {
        heading: "Odczyt storage przez RPC",
        paragraphs: [
          "[[eth-get-storage-at|eth_getStorageAt]] przyjmuje [[address|adres]], numer slotu i [[block-tag|parametr bloku]], a zwraca dokładnie 32 bajty, dopełnione zerami, bez żadnej informacji o typie. Ignoruje widoczność, więc zmienną `private` może odczytać każdy; prywatność w publicznym łańcuchu zależy od tego, jakie dane się w nim umieszcza, a nie od słowa kluczowego. [[eth-get-proof|eth_getProof]] zwraca te same wartości razem z [[storage-proof|dowodem storage]] względem `storageHash` konta i tak właśnie wartość można zweryfikować, zamiast jej ufać.",
          "Dwie rzeczy pozostają niewidoczne: [[transient-storage|transient storage]] zapisywany przez `TSTORE`, który nigdy nie jest utrwalany, oraz wartości, które kontrakt trzyma tylko w pamięci podczas wywołania. Dla nich trzeba zamiast tego uruchomić getter przez [[eth-call|eth_call]]."
        ]
      }
    ],
    example: {
      title: "Odczyt salda ERC-20 prosto ze storage",
      note: "W Solidity najpierw idzie klucz, a potem numer slotu; zamiana kolejności daje poprawnie wyglądający slot, który zawsze zawiera zero. `0x<Token>` oznacza adres tokena: na przykład USDC trzyma salda w slocie 9, a nie 1."
    },
    pitfalls: [
      "Hashowanie numeru slotu przed kluczem przy wyliczaniu pozycji w mappingu Solidity; tam kolejność to klucz, potem slot, odwrotnie niż w Vyperze, a błędna kolejność po cichu zwraca zera.",
      "Odczytanie spakowanego slotu i użycie całych 32 bajtów jako jednej liczby zamiast wyciągnięcia zakresu bajtów danego pola.",
      "Zakładanie, że numery slotów przetrwają upgrade kontraktu; dodanie zmiennej w środku listy deklaracji przesuwa wszystko, co jest za nią.",
      "Przekonanie, że `private` ukrywa wartość przed RPC; to słowo kluczowe blokuje tylko odczyt przez inne kontrakty."
    ]
  },
  state: {
    title: "Stan globalny",
    aliases: ["world state", "stan", "trie stanu", "aktualny stan", "stan historyczny", "przyrost stanu"],
    summary: "Stan globalny to mapowanie każdego [[address|adresu]] na jego [[account|konto]] wraz ze [[contract-storage|storage]] każdego kontraktu, w postaci, jaką ma po konkretnym [[block|bloku]]; prawie każda metoda odczytu odpowiada na podstawie jednej jego wersji.",
    sections: [
      {
        heading: "Stan a historia",
        paragraphs: [
          "Węzeł przechowuje dwie różne rzeczy. Historia to sekwencja bloków, [[transaction|transakcji]], [[transaction-receipt|receiptów]] i [[event-log|logów]], które już się wydarzyły; gdy jest kanoniczna, nigdy się nie zmienia. Stan to bieżąca wartość wszystkiego: sald, [[nonce|nonce]], kodu i slotów storage. [[eth-get-logs|eth_getLogs]] i [[eth-get-transaction-by-hash|eth_getTransactionByHash]] czytają historię; [[eth-get-balance|eth_getBalance]], [[eth-get-code|eth_getCode]], [[eth-get-storage-at|eth_getStorageAt]] i [[eth-call|eth_call]] czytają stan. To rozróżnienie decyduje, który węzeł może odpowiedzieć, bo [[historical-data|przechowywanie starej historii]] i przechowywanie starego stanu to osobne koszty.",
          "Stan jest wersjonowany blok po bloku; nie ma jednej globalnej wersji. Każdy przekazany [[block-tag|parametr bloku]] wybiera jedną wersję, a węzeł musi umieć ją odtworzyć. [[full-node|Pełny węzeł]] trzyma ostatnie wersje, [[archive-node|węzeł archiwalny]] wszystkie, a [[pruned-node|pruned node]] dla wszystkiego, co jest starsze niż jego okno, odpowiada „missing trie node” albo „state not available”, choć sam blok nadal ma."
        ]
      },
      {
        heading: "Jak zmienia się stan",
        paragraphs: [
          "Stan zmienia wyłącznie wykonanie bloku. Każda transakcja po kolei nakłada swoje efekty, [[withdrawals|wypłaty]] (withdrawals) zasilają salda walidatorów, choć w ogóle nie są transakcjami, a na końcu klient oblicza [[state-root|state root]] i porównuje go z nagłówkiem. Nic poza blokiem nie może zmienić żadnej wartości, dlatego nie ma metody RPC, która zapisuje stan bezpośrednio, a [[state-override|state overrides]] istnieją tylko wewnątrz symulacji.",
          "Ta sama zasada sprawia, że stan jest deterministyczny: odtworzenie łańcucha od [[genesis|bloku genesis]] według tych samych reguł daje w każdym kliencie stan identyczny co do bajtu. [[execution-client|Klient wykonawczy]] może przechowywać go, jak chce, jako trie, jako płaskie pary klucz-wartość albo na oba sposoby, byle root się zgadzał."
        ]
      },
      {
        heading: "Rozmiar i przyrost",
        paragraphs: [
          "Stan tylko rośnie: wyzerowanie slotu niewiele zwalnia, a trie i tak dalej się rozrasta, bo pojawiają się nowe konta i kontrakty. Ten przyrost to główne obciążenie dla operatorów węzłów, bo stan musi leżeć na szybkim dysku, żeby dało się go czytać w tempie bloków. Z jego powodu trwają prace nad [[stateless-ethereum|podejściem stateless]] i nad [[client-storage|formatami przechowywania danych]], które wymieniają koszt dowodów na miejsce na dysku. Historię natomiast można przenieść poza węzeł i właśnie to robi [[history-expiry|history expiry]] (usuwanie starej historii z węzłów)."
        ]
      },
      {
        heading: "Spójność odczytów",
        paragraphs: [
          "Dwa odczyty na `latest` wykonane chwilę po sobie mogą trafić na różne bloki, więc wszystko, co musi być ze sobą spójne, powinno wskazywać jeden konkretny numer bloku albo [[block-hash|hash bloku]]. Za [[load-balancer|load balancerem]] ryzyko jest większe, bo dwa węzły mogą widzieć różny head łańcucha. Gdy wartość ma być weryfikowalna, a nie tylko świeża, [[eth-get-proof|eth_getProof]] zwraca konto i sloty razem z dowodem względem state root tego bloku."
        ]
      }
    ],
    pitfalls: [
      "Pytanie pełnego węzła o stan w bloku sprzed roku i odczytanie błędu jako uszkodzenia danych; stan został usunięty przez pruning, a blok nie.",
      "Zakładanie, że endpoint archiwalny potrafi udowodnić stary stan; niektóre układy danych archiwalnych umieją odtworzyć historyczne wartości, ale nie potrafią odbudować historycznego trie dla [[eth-get-proof|eth_getProof]].",
      "Łączenie receiptu z jednego węzła ze stanem z drugiego, co po cichu porównuje dwa różne heady łańcucha.",
      "Traktowanie stanu `pending` jak obrazu całej sieci; to domysł jednego węzła co do następnego bloku, oparty na jego własnym [[mempool|mempoolu]]."
    ]
  },
  "state-root": {
    title: "State root",
    aliases: ["stateRoot", "korzeń stanu", "state commitment", "post-state root", "trie root", "korzeń trie stanu"],
    summary: "State root to 32-bajtowy hash korzenia [[merkle-patricia-trie|trie stanu]], zapisany w każdym [[block-header|nagłówku bloku]]: jedna wartość, która jest commitmentem do każdego [[account|konta]] i każdego slotu storage na koniec danego [[block|bloku]].",
    sections: [
      {
        heading: "Co obejmuje state root",
        paragraphs: [
          "Kluczem w trie stanu jest hash [[keccak-256|Keccak-256]] każdego [[address|adresu]], a liście to zakodowane w [[rlp|RLP]] rekordy kont. Każdy rekord zawiera własny storage root danego kontraktu, więc state root pośrednio obejmuje też każdy slot [[contract-storage|storage każdego kontraktu]]. Wystarczy zmienić jedno wei w jednym saldzie, a zmienia się liść, zmienia się każdy trie node na ścieżce w górę, a korzeń staje się zupełnie inny.",
          "To post-state root, czyli korzeń stanu po wykonaniu bloku: wartość w nagłówku N opisuje [[state|stan globalny]] po zastosowaniu transakcji i [[withdrawals|wypłat walidatorów]] (withdrawals) bloku N, a nie stan sprzed ich zastosowania. Klienci przeliczają go na końcu wykonania i to właśnie jest kosztowna część przetwarzania bloku."
        ]
      },
      {
        heading: "Dlaczego wszyscy klienci muszą się zgadzać",
        paragraphs: [
          "Proposer wpisuje do nagłówka korzeń, który sam wyliczył. Każdy inny węzeł wykonuje ten sam blok i porównuje wynik; niezgodność oznacza, że blok zostaje odrzucony jako nieprawidłowy, a [[execution-client|klient wykonawczy]] odpowiada przez [[engine-api|Engine API]] statusem `INVALID`. Dzięki temu mechanizmowi błąd w kliencie kończy się widocznym podziałem łańcucha (chain split), a nie cichą rozbieżnością. Ten sam mechanizm sprawia, że klient używany przez superwiększość sieci jest ryzykiem systemowym, o czym przypominają inicjatywy na rzecz [[client-diversity|różnorodności klientów]].",
          "Korzeń wynika z samych danych, a nie z bazy danych, więc dwóch klientów o zupełnie różnych [[client-storage|sposobach przechowywania danych]] wylicza z tego samego stanu ten sam korzeń. Sposób przechowywania stanu na dysku w ogóle nie jest częścią protokołu."
        ]
      },
      {
        heading: "Użycie przez RPC",
        paragraphs: [
          "`stateRoot` przychodzi z każdym blokiem zwracanym przez [[eth-get-block-by-number|eth_getBlockByNumber]] i to on jest punktem odniesienia przy weryfikacji: [[eth-get-proof|eth_getProof]] zwraca trie node'y od liścia aż do tego korzenia, a wywołujący, który ma już [[trusted-header|zaufany nagłówek]], może sprawdzić saldo albo slot, nie ufając węzłowi, który udzielił odpowiedzi; zobacz [[state-proof|dowody stanu]]. Receipty i logi są objęte innymi korzeniami, więc dla logu potrzebny jest [[receipt-proof|dowód receiptu]].",
          "Do zbudowania takiego dowodu potrzebny jest historyczny trie, a nie tylko historyczne wartości, dlatego wiele węzłów, które obsłużą [[eth-call|eth_call]] na starym bloku, nadal nie obsłuży na nim `eth_getProof`. Zanim zaprojektuje się coś wokół tej metody, trzeba sprawdzić endpoint."
        ]
      }
    ],
    pitfalls: [
      "Weryfikowanie dowodu względem korzenia niewłaściwego bloku; nagłówek, względem którego się sprawdza, musi należeć dokładnie do bloku, na którym wygenerowano dowód.",
      "Traktowanie state root jako commitmentu do transakcji lub logów bloku; one mają w nagłówku własne korzenie.",
      "Zakładanie, że [[archive-node|węzeł archiwalny]] wygeneruje dowód dla dowolnego minionego bloku, choć może umieć jedynie odtworzyć wartości.",
      "Uznawanie zgodnego state root za dowód, że łańcuch jest kanoniczny; dowodzi on spójności, a nie tego, że ktoś inny budował dalej na tym bloku."
    ]
  },
  "logs-bloom": {
    title: "Filtr Blooma dla logów (logsBloom)",
    aliases: ["logsBloom", "filtr blooma", "bloom filter", "2048 bitów", "filtrowanie logów", "false positive", "fałszywe trafienie"],
    summary: "Każdy [[block-header|nagłówek]] i każdy [[transaction-receipt|receipt]] zawiera logs bloom, czyli 2048-bitowy filtr Blooma zbudowany z adresów i topics [[event-log|logów]], które obejmuje. Dzięki niemu węzeł może wykluczyć blok ze skanowania logów bez czytania jego receiptów.",
    sections: [
      {
        heading: "Jak powstaje filtr",
        paragraphs: [
          "Dla każdego logu emitujący [[address|adres]] i każdy z jego topics hashuje się [[keccak-256|Keccak-256]]. Z pierwszych sześciu bajtów tego hasha bierze się trzy pozycje bitów: każda para bajtów jest redukowana do liczby 11-bitowej, co wystarcza dokładnie na wskazanie jednego z 2048 bitów. Te trzy bity zostają ustawione. Bloom receiptu obejmuje jego własne logi, a bloom nagłówka to bitowy OR wszystkich bloomów receiptów w [[block|bloku]], więc jeden filtr podsumowuje cały blok.",
          "Filtr nie przechowuje informacji o tym, ile elementów ustawiło dany bit, więc nie da się go odwrócić ani opróżnić. Odpowiada dokładnie na jedno pytanie: czy ten element może tu być."
        ]
      },
      {
        heading: "Fałszywe trafienia tak, przeoczenia nigdy",
        paragraphs: [
          "Jeśli którykolwiek z trzech bitów elementu jest zerem, elementu na pewno nie ma, i właśnie to czyni filtr użytecznym. Jeśli wszystkie trzy są ustawione, element prawdopodobnie jest, ale może to być kolizja z innymi logami, czyli fałszywe trafienie (false positive), więc węzeł i tak musi wczytać receipty i porównać je dokładnie. Bloki z dużym ruchem ustawiają sporą część z 2048 bitów, a nasycony bloom pasuje niemal do wszystkiego, więc oszczędność maleje właśnie wtedy, gdy bloki są pełne.",
          "Bloom obejmuje tylko adresy i topics. Pola `data` logu w nim nie ma i to jeden z powodów, dla których [[eth-get-logs|eth_getLogs]] w ogóle nie potrafi filtrować po danych."
        ]
      },
      {
        heading: "Gdzie ma to znaczenie dla RPC",
        paragraphs: [
          "Zapytanie o logi z zakresu bloków to w naiwnej implementacji sprawdzenie blooma każdego bloku, a potem odczyt receiptów z bloków-kandydatów. Dlatego wąski filtr na szerokim zakresie nadal może działać wolno i dlatego [[rpc-provider|dostawcy RPC]] ograniczają zakresy i liczą opłaty za każdy przeskanowany blok. [[geth|Geth]], [[erigon|Erigon]] oraz [[nethermind|Nethermind]], jeśli ma włączony indeks, budują własne [[log-index|indeksy logów]] i dla zakresów, które te indeksy obejmują, pomijają bloom nagłówka; w przypadku Getha jest to domyślnie niedawne okno bloków. [[reth|Reth]] nadal skanuje bloomy nagłówków. Propozycje usunięcia blooma z nagłówka na rzecz lepszej struktury były dyskutowane, ale nie weszły w życie.",
          "Dla [[indexer|indeksera]] sprawdzanie blooma po stronie klienta przed pobraniem receiptów rzadko się opłaca, bo samo pobranie nagłówka kosztuje już osobny round trip. Filtrowanie po `blockHash` albo po wąskich zakresach zwykle wypada lepiej."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie dopasowania w bloomie jak pewnego trafienia; trzeba je sprawdzić na faktycznych logach, inaczej policzy się eventy, które nigdy nie miały miejsca.",
      "Próby filtrowania po `data` logu za pomocą blooma albo [[eth-get-logs|eth_getLogs]]; filtrować można tylko po adresie i indeksowanych topics.",
      "Zakładanie, że brak trafienia w bloomie sprawdzonym na jednym węźle oznacza, że eventu nie ma; ten bloom obejmuje tylko sprawdzony blok.",
      "Czytanie `logsBloom` z receiptu tak, jakby obejmował cały blok; bloom receiptu obejmuje tylko logi tej jednej transakcji."
    ]
  },
  "keccak-256": {
    title: "Keccak-256",
    aliases: ["keccak256", "sha3", "web3_sha3", "funkcja haszująca", "funkcja skrótu", "to nie SHA3-256"],
    summary: "Keccak-256 to 256-bitowa funkcja hashująca, której Ethereum używa prawie we wszystkich swoich commitmentach: w [[block-hash|hashach bloków]], hashach transakcji, [[address|adresach]], selektorach, topics i kluczach trie. To oryginalny Keccak w wersji zgłoszonej do konkursu, a nie późniejszy standard NIST SHA3-256.",
    sections: [
      {
        heading: "To nie SHA3-256",
        paragraphs: [
          "Ethereum przyjęło Keccak, zanim NIST zakończył jego standaryzację, a standard zmienił potem regułę paddingu. Poza tym obie funkcje mają tę samą konstrukcję, ale dają zupełnie różne hashe: Keccak-256 z pustego wejścia to `0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470`, a SHA3-256 z pustego wejścia zaczyna się od `0xa7ffc6f8`. Biblioteki pogarszają sprawę luźnym nazewnictwem, a sam opcode [[evm|EVM]] przez lata nazywał się `SHA3`, zanim przemianowano go na `KECCAK256`. Gdy hash się nie zgadza, najpierw warto sprawdzić, którą z tych dwóch funkcji policzyła biblioteka."
        ]
      },
      {
        heading: "Wszędzie w warstwie wykonawczej",
        paragraphs: [
          "[[block-hash|Hash bloku]] to Keccak-256 z zakodowanego w [[rlp|RLP]] [[block-header|nagłówka]], a hash transakcji to Keccak-256 z jej zakodowanej postaci. [[address|Adres]] konta EOA to ostatnie 20 bajtów hasha jego klucza publicznego, a adres z `CREATE2` hashuje konto wdrażające, salt i init code. Klucze w [[merkle-patricia-trie|trie]] też są hashowane: `keccak256(address)` w trie [[state|stanu]] i `keccak256(slot)` w [[contract-storage|storage]], dlatego pozycje w storage wyglądają na losowe. Selektory w [[abi|ABI]] i `topic0` w [[event-signature|sygnaturach eventów]] pochodzą z hasha tekstowej sygnatury, a [[ecdsa-signature|podpisywanie]] najpierw hashuje nim payload.",
          "[[consensus-layer|Warstwa konsensusu]] nie idzie tą drogą: merkleizacja [[ssz|SSZ]] używa SHA-256, podobnie jak versioned hash [[blob|bloba]]. Struktura hashowana przez SHA-256 prawie zawsze pochodzi ze strony konsensusu, a hashowana przez Keccak-256 prawie zawsze ze strony wykonawczej."
        ]
      },
      {
        heading: "Hashowanie przez RPC",
        paragraphs: [
          "`web3_sha3` przyjmuje [[hex-encoding|DATA]] i wbrew nazwie zwraca ich hash Keccak-256. To tani sposób, żeby sprawdzić, co endpoint rozumie przez tę nazwę, i zweryfikować selektor bez lokalnej biblioteki. Nic innego w [[json-rpc|JSON-RPC warstwy wykonawczej]] nie liczy hashy za wywołującego: kto potrzebuje topicu, selektora albo slotu storage, liczy go po swojej stronie, a każda biblioteka udostępnia do tego `keccak256` albo, w ethers, `id` dla stringów."
        ]
      }
    ],
    pitfalls: [
      "Wywołanie funkcji biblioteki o nazwie `sha3` w przekonaniu, że to Keccak; niektóre pakiety kierują ją do wariantu NIST, który po cichu daje inny selektor.",
      "Hashowanie sygnatury z nazwami argumentów albo spacjami; kanoniczna postać to `transfer(address,uint256)`, bez nazw, bez spacji i bez aliasów typu `uint`.",
      "Używanie Keccak-256 tam, gdzie warstwa konsensusu oczekuje SHA-256, na przykład przy odtwarzaniu beacon root albo versioned hasha bloba.",
      "Hashowanie stringa hex zamiast bajtów, które on reprezentuje, co daje poprawnie wyglądający, ale bezsensowny hash."
    ]
  },
  rlp: {
    title: "Kodowanie RLP",
    aliases: ["Recursive Length Prefix", "surowa transakcja", "raw transaction", "serializacja", "0x80", "0xc0"],
    summary: "RLP (Recursive Length Prefix) to format serializacji [[execution-layer|warstwy wykonawczej]] dla zagnieżdżonych ciągów bajtów i list. Określa dokładnie, jakie bajty są hashowane i podpisywane w przypadku [[block-header|nagłówków]], [[transaction|transakcji]], receiptów i [[merkle-patricia-trie|trie node'ów]].",
    sections: [
      {
        heading: "Dwa rodzaje danych i nic więcej",
        paragraphs: [
          "RLP zna tylko ciągi bajtów i listy elementów. Pojedynczy bajt poniżej `0x80` oznacza sam siebie; ciąg do 55 bajtów dostaje prefiks `0x80` powiększony o swoją długość; dłuższe ciągi mają prefiks, który koduje długość długości. Listy działają tak samo, począwszy od `0xc0`. To cały format i dlatego już pierwszy bajt kodowania mówi, czy patrzymy na listę.",
          "Nie ma typów. Liczby całkowite to ciągi bajtów big-endian bez zer wiodących, więc zero, pusty ciąg i brak wartości kodują się jako `0x80`, a wartości logiczne to `0x01` i `0x80`. Dekoder nie wie więc, co zdekodował, jeśli nie zna oczekiwanej struktury. To cena za kodowanie kanoniczne: jedna wartość ma dokładnie jedno poprawne kodowanie i właśnie dlatego hashowanie jej ma sens."
        ]
      },
      {
        heading: "Co jest kodowane w RLP",
        paragraphs: [
          "W RLP zapisuje się listę pól nagłówka, której hash [[keccak-256|Keccak-256]] jest [[block-hash|hashem bloku]]; całe transakcje legacy oraz payload każdej [[transaction-types|transakcji typowanej]] po początkowym bajcie typu; receipty, node'y trie stanu i trie storage oraz wiadomości protokołu sieciowego [[devp2p|devp2p]]. Równie ważne jest to, co nie jest w RLP: calldata używa kodowania [[abi|ABI]], obiekty konsensusu używają [[ssz|SSZ]], a sama warstwa RPC to JSON."
        ]
      },
      {
        heading: "Gdzie pojawia się w RPC",
        paragraphs: [
          "[[eth-send-raw-transaction|eth_sendRawTransaction]] przyjmuje podpisaną transakcję jako bajty w hex; dla transakcji typowanej to bajt typu, a po nim lista RLP. Buduje ją biblioteka, ale debugowanie odrzuconej transakcji oznacza dekodowanie jej ręcznie. Przestrzeń nazw [[debug-api|debug_]] zwraca bajty protokołu wprost przez `debug_getRawBlock`, `debug_getRawTransaction` i `debug_getRawReceipts` i w ten sposób porównuje się to, co węzeł przechowuje, z tym, co raportuje. [[eth-get-proof|eth_getProof]] zwraca trie node'y ze ścieżki w RLP, więc weryfikacja dowodu oznacza zdekodowanie i zahashowanie każdego z nich.",
          "Poza tymi przypadkami warstwa [[json-rpc|JSON-RPC]] niczego nie koduje do RLP w imieniu wywołującego ani niczego z RLP nie dekoduje: endpoint, który zwraca surowe bajty, zakłada, że wywołujący ma własny dekoder."
        ]
      }
    ],
    pitfalls: [
      "Kodowanie liczby całkowitej z zerami wiodącymi albo w stałej szerokości; liczby w RLP mają postać minimalną, a kodowanie nieminimalne daje inny hash i zostaje odrzucone.",
      "Przekazywanie transakcji typowanej do dekodera RLP bez wcześniejszego usunięcia początkowego bajtu typu.",
      "Zakładanie typu zdekodowanego elementu; RLP zwraca bajty, a odczytanie 20-bajtowego ciągu jako liczby to cichy błąd.",
      "Mylenie RLP z kodowaniem ABI; oba dają nieprzejrzyste ciągi hex, ale w calldata nic nie jest w RLP."
    ]
  },
  ssz: {
    title: "Kodowanie SSZ",
    aliases: [
      "simpleserialize",
      "serializacja ssz",
      "merkleizacja",
      "hash tree root",
      "format binarny beacon api",
      "kodowanie warstwy konsensusu"
    ],
    summary: "SSZ (SimpleSerialize) to kodowanie [[consensus-layer|warstwy konsensusu]]: układ części stałych i zmiennych wyznaczany przez schemat, połączony z merkleizacją do hash tree root, dzięki czemu da się udowodnić dowolne pojedyncze pole dużego obiektu.",
    sections: [
      {
        heading: "Serializacja ze schematem",
        paragraphs: [
          "Każdy typ SSZ ma zadeklarowany kształt. Pola o stałym rozmiarze są zapisywane po kolei bezpośrednio w miejscu; pola o zmiennym rozmiarze są zapisywane jako czterobajtowy offset w części początkowej (head), a ich zawartość jest dopisywana w części końcowej (tail). Listy mają maksymalną długość określoną przez typ, a nie przez dane. Wynik jest deterministyczny i bezpośrednio adresowalny: dekoder, który zna schemat, może skoczyć do pola bez parsowania tego, co je poprzedza, inaczej niż w [[rlp|RLP]], gdzie trzeba przechodzić po kolejnych długościach."
        ]
      },
      {
        heading: "Merkleizacja i hash tree root",
        paragraphs: [
          "Dla weryfikacji najważniejszy jest hash tree root. Obiekt dzieli się na 32-bajtowe liście, uzupełnia ich liczbę do potęgi dwójki i hashuje je parami funkcją SHA-256, aż zostanie jeden root; listy dodatkowo wplatają w wynik swoją długość. Kształt drzewa wynika z typu, więc każde pole ma stałą pozycję, wyrażoną jako [[generalized-index|generalized index]], a dowód dla tego pola to hashe sąsiednich node'ów na jego ścieżce.",
          "Dzięki temu dane konsensusu da się udowadniać w sposób niedostępny dla danych warstwy wykonawczej: [[light-client|lekki klient]] może zweryfikować jedno pole stanu beacon względem rootu, któremu ufa. `parentBeaconBlockRoot` w [[block-header|nagłówku]] bloku warstwy wykonawczej jest właśnie takim rootem. Dlatego EIP-4788 w ogóle pozwala kontraktom sięgać do danych konsensusu, a [[consensus-proof|dowody konsensusu]] mogą prowadzić od [[beacon-block|bloku beacon]] w dół, aż do nagłówka [[execution-payload|execution payload]]."
        ]
      },
      {
        heading: "SSZ w API",
        paragraphs: [
          "[[beacon-api|Beacon API]] domyślnie zwraca JSON, a bajty SSZ wtedy, gdy wywołujący wyśle `Accept: application/octet-stream`. Ta forma jest dużo mniejsza i z niej korzystają klienci przy pobieraniu bloków i stanów; sidecary blobów i stany beacon rutynowo pobiera się właśnie tak. [[json-rpc|JSON-RPC warstwy wykonawczej]] nigdy nie zwraca SSZ, więc wszystko, co przekracza tę granicę, na przykład dowód logu z warstwy wykonawczej dla weryfikatora po stronie konsensusu, musi tłumaczyć między dwoma światami hashy: drzewami Merkle z SHA-256 po jednej stronie, a [[keccak-256|Keccak-256]] i [[merkle-patricia-trie|Merkle-Patricia Trie]] po drugiej. Prace nad przeniesieniem struktur warstwy wykonawczej na SSZ trwają od lat, ale obiekty, które RPC serwuje dziś, nadal opierają się na RLP."
        ]
      }
    ],
    pitfalls: [
      "Dekodowanie SSZ bez dokładnego typu dla bieżącego forka; schemat zmienia się przy aktualizacjach sieci, a stary dekoder odczyta nowy obiekt jako śmieci.",
      "Hashowanie SSZ funkcją Keccak-256; merkleizacja używa SHA-256, więc root po prostu się nie zgodzi.",
      "Traktowanie rootu bloku beacon jako [[block-hash|hasha bloku]] warstwy wykonawczej; identyfikują różne obiekty i są liczone inaczej.",
      "Pobieranie dużych stanów jako JSON z przyzwyczajenia, choć reprezentacja SSZ to ułamek tego rozmiaru."
    ]
  },
  "ecdsa-signature": {
    title: "Podpisy transakcji",
    aliases: ["secp256k1", "ECDSA", "podpis ECDSA", "r s v", "yParity", "ecrecover", "EIP-155"],
    summary: "Podpis transakcji to podpis ECDSA na krzywej secp256k1, złożony na hashu [[keccak-256|Keccak-256]] danych transakcji przeznaczonych do podpisu i przenoszony jako `r`, `s` oraz `v` albo `yParity`. Każdy może z niego odzyskać [[address|adres]] nadawcy.",
    sections: [
      {
        heading: "Podpisywanie i odzyskiwanie nadawcy",
        paragraphs: [
          "Nadawca serializuje wszystko poza podpisem, hashuje to i podpisuje hash swoim kluczem prywatnym. Wynikiem są dwie 32-bajtowe liczby, `r` i `s`, plus jeden bit, który mówi, który z dwóch możliwych kluczy publicznych wybrać przy odzyskiwaniu (recovery). Węzeł wykonuje to odzyskiwanie, żeby ustalić, kto wysłał [[transaction|transakcję]]; w podpisanych danych nie ma pola `from`, a `from` widoczne przez RPC to odzyskana wartość. Podpis, z którego odzyskuje się [[account|konto]] bez środków, nie przejdzie sprawdzenia salda, ale odpadnie jako transakcja tego konta, a nie jako źle sformułowana wiadomość.",
          "Dwie reguły nie pozwalają przekształcać podpisów. EIP-2 wymaga, żeby `s` leżało w dolnej połowie rzędu krzywej, więc tego samego podpisu nie da się przerobić na drugą, równie poprawną postać z innym hashem, a `yParity` może mieć tylko wartość `0` albo `1`. Zmiana dowolnego bajtu transakcji zmienia hash, więc z podpisu nie wychodzi już ten sam nadawca: w podpisanej transakcji nie da się niczego zmienić po drodze."
        ]
      },
      {
        heading: "v, chain ID i transakcje typowane",
        paragraphs: [
          "Transakcje legacy zapisywały bit odzyskiwania w `v` jako `27` albo `28`. W EIP-155 zdefiniowano je na nowo jako `chainId * 2 + 35 + parity`, co wplata [[chain-id|chain ID]] w podpisywane dane i właśnie to nie pozwala powtórzyć transakcji z mainnetu w innym łańcuchu. [[transaction-types|Transakcje typowane]] porzuciły tę sztuczkę: mają `chainId` jako zwykłe pole i `yParity` jako bit, choć wielu klientów nadal zwraca dla zgodności równoważne `v`."
        ]
      },
      {
        heading: "Podpisy a RPC",
        paragraphs: [
          "Klucz prywatny nigdy nie trafia do węzła. Bajty tworzy portfel albo usługa podpisująca, a węzeł widzi je tylko wewnątrz [[eth-send-raw-transaction|eth_sendRawTransaction]]; dlatego publiczny endpoint jest kanałem dostarczania, a nie powiernikiem kluczy. Wyjątkiem jest [[eth-send-transaction|eth_sendTransaction]], przy którym węzeł podpisuje kluczem, który sam przechowuje, i właśnie dlatego publiczne węzły wyłączają tę metodę.",
          "Na tej samej krzywej opiera się [[signing-methods|podpisywanie wiadomości]] off-chain, na przykład wiadomości personal z EIP-191 i typed data z [[eip-712|EIP-712]], weryfikowanych w kontraktach przez [[precompiles|precompile]] `ECRECOVER`, a także autoryzacje [[eip-7702|EIP-7702]], czyli podpisy nad małą krotką, a nie nad transakcją. Ta sama kryptografia, inny payload, a prefiks payloadu sprawia, że jednego podpisu nie da się powtórzyć jako drugiego."
        ]
      }
    ],
    pitfalls: [
      "Ufanie polu `from` z niezaufanego źródła; nic ono nie znaczy, dopóki nadawca nie zostanie odzyskany z podpisu, a wie to tylko węzeł, który go odzyskuje.",
      "Akceptowanie podpisu z wysoką wartością `s`, jaką generują starsze biblioteki, a którą współcześni klienci i kontrakty odrzucają.",
      "Podpisywanie wiadomości, którą dałoby się zdekodować jako payload transakcji; prefiksy i domeny EIP-712 istnieją po to, żeby te przestrzenie się nie przecinały.",
      "Zakładanie, że poprawny podpis oznacza poprawną transakcję; sprawdzenia nonce, salda i opłaty są osobne i następują później."
    ]
  },
  wei: {
    title: "Wei, gwei i ether",
    aliases: ["gwei", "ether", "jednostki ethera", "1e18", "BigInt", "decimals"],
    summary: "Wei to niepodzielna jednostka etheru: jeden ether to 10 do potęgi 18 wei, a jeden gwei to 10 do potęgi 9 wei. Każde saldo, `value` i każda opłata w JSON-RPC to całkowita liczba wei zapisana w hex jako [[hex-encoding|QUANTITY]].",
    sections: [
      {
        heading: "Jedna jednostka, trzy nazwy",
        paragraphs: [
          "Protokół zna tylko wei. Ether to konwencja wyświetlania, a gwei to wygodna jednostka do podawania opłat, bo o 25000000000 wei łatwiej mówić jako o 25 gwei. [[evm|EVM]] przechowuje salda i `value` jako 256-bitowe liczby całkowite wei, a [[eip-1559|pola opłat]] są wyrażone w wei za jednostkę [[gas|gasu]], więc koszt transakcji w wei to `gasUsed` pomnożone przez `effectiveGasPrice`.",
          "Kwoty tokenów to nie wei i nie są danymi protokołu. Kontrakt ERC-20 przechowuje zwykłą liczbę całkowitą i publikuje wartość `decimals`, która mówi, gdzie postawić przecinek: dla wielu tokenów 18, ale dla USDC 6, a dla wrapped bitcoina 8. Nic tego nie wymusza; zobacz [[token-standards|standardy tokenów]]. Odczyt salda tokena bez odczytu jego decimals daje wynik błędny o czynnik dziesięć do potęgi tej wartości: milion razy dla USDC i 10 do potęgi 18 dla większości pozostałych tokenów."
        ]
      },
      {
        heading: "Dlaczego w odpowiedziach jest hex",
        paragraphs: [
          "Jeden ether to 10 do potęgi 18 wei, a zakres bezpiecznych liczb całkowitych w JavaScripcie kończy się tuż powyżej 9 razy 10 do potęgi 15, czyli poniżej jednej setnej etheru. Parsowanie salda do typu double gubi więc wei, i to po cichu. [[json-rpc|JSON-RPC warstwy wykonawczej]] unika tego problemu, zwracając każdą liczbę jako string hex z prefiksem `0x`, bez zer wiodących, a zero jako `0x0`. Takie wartości trzeba dekodować przez `BigInt` albo typ o dowolnej precyzji, nigdy przez `parseFloat`, i uważać na parsery JSON, które usłużnie zamieniają stringi na liczby."
        ]
      },
      {
        heading: "Bezpieczna konwersja",
        paragraphs: [
          "[[client-libraries|Biblioteki]] mają gotowe konwersje: `parseEther` i `formatEther` dla przypadku z 18 miejscami po przecinku, `parseUnits` i `formatUnits` dla wszystkich innych. Całą arytmetykę trzeba robić na całkowitych wei, a konwertować dopiero na samym brzegu, tam gdzie liczbę czyta człowiek. Wczesna konwersja i późniejsze dodawanie liczb zmiennoprzecinkowych to prosta droga do tego, żeby wyświetlane saldo rozjechało się o kilka wei, a księgowość giełdy o więcej. Przy wyświetlaniu warto świadomie wybrać regułę zaokrąglania, bo obcięcie 0,9999 etheru do dwóch miejsc mówi użytkownikowi, że ma 0,99."
        ]
      }
    ],
    example: {
      title: "Te same kwoty w każdej jednostce",
      note: "Tylko pierwsza część to dane protokołu; kwota tokena nic nie znaczy, dopóki nie odczyta się `decimals` tego kontraktu."
    },
    pitfalls: [
      "Parsowanie kwoty w wei przez `Number` albo `parseFloat`; wszystko powyżej około 0,009 etheru traci precyzję bez żadnego błędu.",
      "Zakładanie 18 miejsc po przecinku dla każdego tokena, przez co saldo USDC wychodzi bilion razy za małe, bo USDC używa sześciu.",
      "Mieszanie jednostek w jednym wyrażeniu, na przykład mnożenie ilości gasu przez cenę już przeliczoną na gwei.",
      "Wysyłanie `value` wyliczonego jako liczba zmiennoprzecinkowa; to pole jest całkowitą liczbą wei, a artefakt zaokrąglenia staje się prawdziwą płatnością."
    ]
  },
  abi: {
    title: "ABI kontraktu",
    aliases: ["selektor", "selector", "encodeFunctionData", "kodowanie calldata", "application binary interface", "abi"],
    summary: "ABI (application binary interface) to konwencja, która zamienia wywołanie funkcji w calldata: czterobajtowy selektor wzięty z hasha [[keccak-256|Keccak-256]] sygnatury, a po nim argumenty w 32-bajtowych słowach; te same reguły służą do dekodowania wyników i [[event-log|eventów]].",
    sections: [
      {
        heading: "Kodowanie wywołania",
        paragraphs: [
          "Selektor to pierwsze cztery bajty hasha kanonicznej sygnatury: nazwy funkcji, a po niej typów argumentów w nawiasach, bez nazw argumentów, bez spacji i z pełnymi nazwami typów, na przykład `uint256` zamiast `uint`. Za selektorem każdy argument statyczny zajmuje dokładnie 32 bajty: liczby i [[address|adresy]] są wyrównane do prawej i dopełnione zerami z lewej, a tablice bajtów o stałej długości wyrównane do lewej. Argument dynamiczny, czyli `string`, `bytes` albo tablica o zmiennej długości, jest na swojej pozycji zastępowany 32-bajtowym offsetem, a jego długość i zawartość są dopisywane za częścią główną (head).",
          "Tylko tyle dostaje węzeł. [[eth-call|eth_call]] przyjmuje te bajty jako `input` i zwraca wynik funkcji zakodowany w ten sam sposób, jako surowe bajty bez nazw i typów. Dekodowanie należy w całości do wywołującego; tym właśnie zajmuje się [[client-libraries|biblioteka]], gdy zamienia wynik w obiekt."
        ]
      },
      {
        heading: "Eventy i błędy według tych samych reguł",
        paragraphs: [
          "`topic0` eventu to hash Keccak jego sygnatury, argumenty indeksowane stają się kolejnymi topics (dynamiczne są najpierw hashowane), a cała reszta trafia zakodowana w ABI do pola `data` logu; zobacz [[event-signature|sygnatury eventów]]. [[revert|Revert]] też jest kodowany jak wywołanie: `Error(string)` ma selektor `0x08c379a0`, `Panic(uint256)` ma `0x4e487b71`, a własny błąd (custom error) ma własny selektor wyliczony z własnej sygnatury. Dekodowanie danych revertu to więc ta sama operacja co dekodowanie wywołania."
        ]
      },
      {
        heading: "Czym ABI nie jest",
        paragraphs: [
          "Plik JSON z ABI, z którego korzystają narzędzia, to wynik pracy kompilatora, a nie dane łańcucha. Nic w łańcuchu nie zapisuje listy funkcji kontraktu, więc nie ma metody RPC, która by ją zwracała; aplikacja dostarcza ABI sama albo pobiera je z [[block-explorer|eksploratora bloków]], który zweryfikował kod źródłowy. W drugą stronę działają publiczne [[signature-directory|katalogi selektorów]], które mapują cztery bajty z powrotem na prawdopodobną sygnaturę.",
          "Cztery bajty to też na tyle mało, że zdarzają się kolizje, celowe albo przypadkowe. Selektor identyfikuje wywołanie tylko z punktu widzenia dispatchera danego kontraktu, więc traktowanie selektora jako dowodu, która funkcja się wykonała, jest błędem, zwłaszcza za proxy, gdzie o jego znaczeniu decyduje [[smart-contract|implementacja]]."
        ]
      }
    ],
    example: {
      title: "Ręczne kodowanie transferu ERC-20",
      note: "Hashowany tu tekst sygnatury nie zawiera nazw argumentów; `transfer(address to,uint256 amount)` dałby inny, błędny selektor."
    },
    pitfalls: [
      "Hashowanie sygnatury z nazwami argumentów, spacjami albo z `uint` zamiast `uint256`, co daje selektor, na który nie odpowiada żaden kontrakt.",
      "Traktowanie pustego wyniku `0x` z `eth_call` jako revertu; ten sam wynik pojawia się, gdy pod adresem nie ma kodu w danym bloku.",
      "Dekodowanie wyniku złym ABI; daje to wiarygodnie wyglądające bzdury, a nie błąd.",
      "Zakładanie, że czterobajtowy selektor jednoznacznie identyfikuje funkcję w całej sieci; kolizje istnieją, a proxy może skierować wywołanie dokądkolwiek."
    ]
  },
  revert: {
    title: "Reverty i błędy",
    aliases: ["REVERT", "execution reverted", "Error(string)", "Panic", "custom error", "require", "własny błąd", "powód revertu"],
    summary: "Revert zatrzymuje bieżącą ramkę wywołania [[evm|EVM]], cofa jej zmiany stanu i zwraca dane, które wyjaśniają przyczynę; RPC pokazuje to jako błąd z `data` w [[eth-call|eth_call]] i jako `status` `0x0` w [[transaction-receipt|receipcie]].",
    sections: [
      {
        heading: "Co robi revert",
        paragraphs: [
          "Opcode `REVERT` kończy ramkę, cofa wszystkie zmiany stanu, które ta ramka wprowadziła, oddaje niewykorzystany [[gas|gas]] i zwraca ciąg bajtów. Właśnie te zwracane bajty odróżniają go od innych rodzajów niepowodzenia: brak gasu albo nieprawidłowy opcode też cofają zmiany ramki, ale spalają cały pozostały gas i niczego nie zwracają. W Solidity `require`, `revert` i zgłoszenie własnego błędu (custom error) kompilują się do `REVERT`, a od wersji 0.8 również `assert`.",
          "Revert dotyczy tylko swojej ramki. Jeśli kontrakt A wywołuje kontrakt B i B robi revert, A widzi flagę niepowodzenia, może ją zignorować i działać dalej, więc [[transaction|transakcja]] może zakończyć się sukcesem ze `status` `0x1`, choć zawiera nieudane wywołania. Niepowodzeniem całej transakcji kończy się tylko revert, który dotrze do najbardziej zewnętrznej ramki, a nawet wtedy transakcja trafia do [[block|bloku]], zużywa gas i zwiększa [[nonce|nonce]]."
        ]
      },
      {
        heading: "Trzy postacie danych revertu",
        paragraphs: [
          "Dane revertu są zakodowane w [[abi|ABI]] tak jak wywołanie funkcji. `Error(string)` ma selektor `0x08c379a0` i przenosi czytelny dla człowieka powód z `require`. `Panic(uint256)` ma `0x4e487b71` i przenosi kod nadawany przez kompilator: `0x01` dla nieudanej asercji, `0x11` dla przepełnienia arytmetycznego, `0x12` dla dzielenia przez zero, `0x32` dla indeksu tablicy poza zakresem. Custom error ma własny selektor wyliczony z własnej sygnatury, więc do jego zdekodowania potrzebne jest ABI kontraktu; bez niego wywołujący widzi cztery bajty i argumenty, których nie potrafi nazwać.",
          "Puste dane revertu to czwarty i najmniej pomocny przypadek. Goły `revert()`, kontrakt w Solidity, który wywołuje funkcję pod [[address|adresem]] bez kodu, albo błąd w bibliotece, która nigdy nie ustawiła powodu, dają `0x`, co mówi tylko tyle, że coś się nie udało. `eth_call` wysłane bezpośrednio na adres bez kodu to co innego: nic się nie wykonuje, a wywołanie kończy się sukcesem z wynikiem `0x`."
        ]
      },
      {
        heading: "Jak RPC zgłasza reverty",
        paragraphs: [
          "[[eth-call|eth_call]] i [[eth-estimate-gas|eth_estimateGas]] odpowiadają na wywołanie z revertem obiektem błędu JSON-RPC zamiast wyniku. Większość klientów, w tym [[geth|Geth]], [[nethermind|Nethermind]] i [[reth|Reth]], używa kodu `3` z komunikatem `execution reverted` i surowymi bajtami revertu w `data`; niektórzy [[rpc-provider|providerzy]] zwracają zamiast tego `-32000` z samym komunikatem, więc kod trzeba traktować jako wskazówkę i szukać `data`. Zobacz też [[rpc-errors|błędy JSON-RPC]], gdzie opisano ich klasyfikację.",
          "Transakcja w bloku to inna sprawa: jej receipt ma `status` `0x0`, nie ma logów i nigdzie nie zawiera powodu. Bajty zostały zwrócone w chwili wykonania i nic ich nie przechowuje. Żeby ustalić, dlaczego transakcja się nie powiodła, trzeba ją odtworzyć przez `eth_call` na bloku, w którym się znalazła, albo poprosić węzeł o trace przez przestrzeń nazw [[debug-api|debug_]] lub [[trace-api|trace_]], który zapisuje wynik revertu każdej ramki."
        ]
      }
    ],
    example: {
      title: "Dane revertu z nieudanego eth_call",
      note: "Te same bajty pojawiają się w błędach `eth_estimateGas` i w trace'ach, więc jeden dekoder obsługuje wszystkie trzy przypadki."
    },
    pitfalls: [
      "Szukanie powodu revertu w receipcie; nie jest tam przechowywany, a odzyskanie go wymaga odtworzenia wywołania albo trace'a transakcji.",
      "Traktowanie braku gasu jak revertu; brak gasu zużywa cały limit i nie zwraca danych, więc nie ma czego dekodować.",
      "Zakładanie, że `status` `0x1` oznacza, że każde wewnętrzne wywołanie się powiodło; kontrakt wywołujący może połknąć revert i normalnie zakończyć działanie.",
      "Zakodowanie na sztywno kodu błędu `3`; klienci i providerzy się tu różnią, a naprawdę liczy się pole `data`.",
      "Pokazywanie użytkownikowi surowego selektora custom errora; bez ABI nic on nie znaczy, a z ABI komunikat jest zwykle konkretny."
    ]
  },
  mempool: {
    title: "Mempool",
    aliases: ["mempool", "pula transakcji", "transaction pool", "pending", "queued", "txpool", "underpriced", "propagacja transakcji"],
    summary: "Mempool (pula transakcji) to lokalny zbiór podpisanych [[transaction|transakcji]] jednego węzła, które są poprawne, ale jeszcze nie trafiły do [[block|bloku]]. Dzieli się na transakcje pending, które można wykonać od razu, i queued, które czekają za luką w [[nonce|nonce]].",
    sections: [
      {
        heading: "Przyjęcie, zastąpienie, wyrzucenie",
        paragraphs: [
          "Gdy [[eth-send-raw-transaction|eth_sendRawTransaction]] przekazuje węzłowi transakcję, mempool sprawdza ją przed przyjęciem: z podpisu musi dać się odzyskać adres nadawcy, [[chain-id|chain ID]] musi się zgadzać, nonce nie może być niższy niż bieżąca wartość konta, saldo musi pokryć `value` plus `gas` razy pułap opłaty, opłata nie może być niższa niż minimum mempoola, a zakodowany rozmiar musi mieścić się w limicie klienta, który w przypadku Geth wynosi 128 KB. Odrzucenie wraca natychmiast jako [[rpc-errors|błąd]] z rozpoznawalnym komunikatem: „nonce too low”, „insufficient funds for gas * price + value”, „replacement transaction underpriced”.",
          "Mempool ma skończoną pojemność. Gdy się zapełni, najtańsze transakcje są wyrzucane. Dlatego [[transaction-lifecycle|transakcja może zniknąć z węzła]], nigdy nie trafiwszy do bloku, i dlatego ponowne wysłanie jest normalnym elementem pracy z transakcjami. Zastąpienie transakcji pending oznacza ponowne użycie jej nonce z opłatą podniesioną o margines wymagany przez klienta, zwykle o dziesięć procent w obu [[eip-1559|polach opłat]]."
        ]
      },
      {
        heading: "Jeden mempool na węzeł, nie obiekt sieci",
        paragraphs: [
          "Węzły ogłaszają peerom hashe transakcji przez [[devp2p|devp2p]], a peery pobierają te, których nie mają, więc mempoole się do siebie zbliżają, ale nigdy nie są identyczne. Dwa węzły różnią się tym, jakie transakcje mają, w jakiej kolejności one dotarły i co zostało wyrzucone; [[blob|transakcja z blobami]] nie jest nawet rozgłaszana w całości, tylko ogłaszana i pobierana na żądanie ze względu na swój sidecar. Nie istnieje więc jeden mempool, są tylko mempoole poszczególnych węzłów, a zdanie „nie ma jej w mempoolu” mówi coś tylko o jednym węźle.",
          "Coraz większa część transakcji w ogóle omija publiczne mempoole. Użytkownicy i [[searcher|searcherzy]] wysyłają je bezpośrednio do builderów przez [[private-rpc|prywatne endpointy transakcji]], żeby uniknąć front-runningu, a takie transakcje pojawiają się po raz pierwszy dopiero w bloku; zobacz [[mev|MEV]]. Wszystko, co mierzy popyt albo [[security-monitoring|wykrywa aktywność]], obserwując transakcje pending, widzi tylko publiczną resztę."
        ]
      },
      {
        heading: "Podgląd mempoola przez RPC",
        paragraphs: [
          "[[eth-get-transaction-by-hash|eth_getTransactionByHash]] zwraca transakcje z mempoola z polami `blockHash`, `blockNumber` i `transactionIndex` ustawionymi na `null`; to najtańszy sposób, by sprawdzić, czy węzeł przyjął wysłaną transakcję. [[eth-get-transaction-count|eth_getTransactionCount]] z [[block-tag|tagiem]] `pending` wlicza transakcje z mempoola do nonce. Przestrzeń nazw [[txpool-api|txpool_]] udostępnia mempool bezpośrednio przez `txpool_status`, `txpool_content` i `txpool_inspect`, a [[eth-subscribe|eth_subscribe]] z `newPendingTransactions` strumieniuje nowo przybyłe transakcje. Publiczne endpointy zwykle wyłączają metody txpool, a subskrypcję obejmują rate limitem, bo pełny zrzut jest duży i zdradza, kto zaraz co zrobi."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie braku transakcji w mempoolu jednego węzła jako dowodu, że nigdy jej nie wysłano; mempoole są lokalne, a prywatny ruch w ogóle się w nich nie pojawia.",
      "Odpytywanie o receipt innego endpointu niż ten, który przyjął transakcję; może on zwracać `null` długo po włączeniu jej do bloku.",
      "Zakładanie, że transakcja pending w końcu trafi do bloku; może zostać wyrzucona, gdy mempool się zapełni albo gdy base fee wzrośnie powyżej jej pułapu opłaty.",
      "Traktowanie `newPendingTransactions` jak uporządkowanej kolejki zawartości następnego bloku; o kolejności, którą ustala proposer, decyduje się gdzie indziej."
    ]
  },
  withdrawals: {
    title: "Wypłaty (withdrawals)",
    aliases: ["wypłaty", "withdrawals", "EIP-4895", "wypłaty walidatorów", "validator withdrawals", "withdrawalsRoot", "sweep", "kwota w gwei"],
    summary: "Wypłata (withdrawal) to zasilenie salda, które [[consensus-layer|warstwa konsensusu]] dopisuje do [[block|bloku]] wykonawczego zgodnie z EIP-4895. Przenosi ETH [[validator|walidatora]] na [[address|adres]] w warstwie wykonawczej, ale nie jest [[transaction|transakcją]], więc nie ma nadawcy, nie zużywa [[gas|gasu]] i nie ma [[transaction-receipt|receiptu]].",
    sections: [
      {
        heading: "Skąd się biorą",
        paragraphs: [
          "Shapella w kwietniu 2023 znów umożliwiła przenoszenie ETH zablokowanego w stakingu. Warstwa konsensusu przechodzi po walidatorach w kolejności indeksów (sweep) i tworzy dwa rodzaje zasileń: wypłatę częściową (partial withdrawal) nadwyżki salda ponad efektywny limit walidatora oraz wypłatę pełną (full withdrawal) całego salda po wyjściu walidatora. Nikt niczego nie podpisuje i nikt nie płaci opłaty; zasilenia umieszcza proposer jako listę w [[execution-payload|execution payload]], a w jednym bloku mieści się ich najwyżej 16.",
          "Sweep może objąć walidatora dopiero wtedy, gdy jego withdrawal credentials (dane określające, dokąd idą wypłaty) wskazują adres w warstwie wykonawczej. Robią to credentials typu `0x01`, a Pectra dodała `0x02` dla walidatorów z kapitalizacją nagród (compounding) i wyższym maksymalnym efektywnym saldem; ich wypłaty częściowe zaczynają się dopiero powyżej tego wyższego pułapu."
        ]
      },
      {
        heading: "Jak wyglądają pola",
        paragraphs: [
          "Każdy wpis w tablicy `withdrawals` bloku ma cztery pola: `index`, globalny licznik, który nigdy się nie zeruje; `validatorIndex`, wskazujący walidatora źródłowego; `address`, czyli odbiorcę; oraz `amount`, kwotę w gwei, a nie w [[wei|wei]]. Ta jednostka to najczęstszy błąd w kodzie obsługującym wypłaty, bo każda inna wartość w [[json-rpc|JSON-RPC]] jest w wei, a różnica to czynnik miliard. [[block-header|Nagłówek]] zawiera commitment do tej listy: `withdrawalsRoot`, czyli root trie zbudowanego nad wpisami, tak samo jak transactions root."
        ]
      },
      {
        heading: "Konsekwencje dla korzystających z RPC",
        paragraphs: [
          "Wypłata nie jest transakcją, więc nie daje receiptu, [[event-log|logu]] ani wpisu w trace. Saldo odbiorcy po prostu różni się między blokiem N-1 a blokiem N. Wszystko, co odtwarza salda, sumując transakcje, przede wszystkim [[indexer|indekser]] albo [[accounting-reconciliation|księgowość giełdy]], po cichu się rozjeżdża na każdym adresie, który dostaje wypłaty, chyba że czyta tablicę `withdrawals` z każdego bloku. [[eth-get-balance|eth_getBalance]] zawsze podaje prawdę, więc porównanie z nim wyliczonego salda to dobry niezmiennik do sprawdzania.",
          "Wypłaty oznaczają też, że adres może zyskać ETH, choć żadna transakcja go nie dotyka, a to łamie założenie, że zmiana salda oznacza aktywność łańcucha na tym adresie. EIP-7002 z Pectry dodał sposób, w jaki [[execution-requests|żądanie z warstwy wykonawczej]] może wywołać wyjście albo wypłatę częściową, ale sama wypłata i tak przychodzi przez ten sam sweep."
        ]
      }
    ],
    pitfalls: [
      "Czytanie `amount` jako wei; to gwei, więc liczba jest miliard razy mniejsza niż wartości w wei we wszystkich pozostałych polach.",
      "Szukanie hasha transakcji dla wypłaty; nie istnieje, a jedynym sposobem, żeby ją zobaczyć, jest wyszukanie adresu w eksploratorze.",
      "Zakładanie, że wypłaty pojawiają się w trace'ach albo receiptach; właśnie w ten sposób uzgadnianie sald po cichu przestaje się zgadzać.",
      "Oczekiwanie pól wypłat w blokach sprzed Shapelli; nie ma tam ani `withdrawals`, ani `withdrawalsRoot`."
    ]
  },
  genesis: {
    title: "Genesis i konfiguracja łańcucha",
    aliases: ["blok 0", "block 0", "genesis.json", "chainspec", "alloc", "harmonogram forków", "fork schedule", "terminal total difficulty"],
    summary: "Blok genesis to blok 0, zdefiniowany w pliku konfiguracyjnym, a nie powstały w wyniku wykonania transakcji. Konfiguracja łańcucha obok niego ustala [[chain-id|chain ID]] oraz blok albo timestamp, w którym aktywuje się każda [[hardfork|aktualizacja sieci]].",
    sections: [
      {
        heading: "Co definiuje genesis",
        paragraphs: [
          "Plik genesis zawiera początkowy przydział sald (alokację), a w sieciach testowych także zasilone z góry konta deweloperskie i gotowy kod kontraktów. Klient buduje z tego [[state|stan]], oblicza jego [[state-root|state root]], uzupełnia pola nagłówka podane w pliku, takie jak `gasLimit`, `timestamp` i `extraData`, i liczy hash bloku. Ten hash jest tożsamością sieci: dla mainnetu Ethereum to `0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3`, a węzeł zbudowany z innego pliku obliczy inny blok 0 i nie będzie podążał za tym samym łańcuchem."
        ]
      },
      {
        heading: "Harmonogram forków",
        paragraphs: [
          "Obok alokacji jest konfiguracja łańcucha: chain ID i punkt aktywacji każdej zmiany reguł. Aktualizacje sprzed Merge planuje się według numeru bloku, wszystkie późniejsze według timestampu (`shanghaiTime`, `cancunTime`, `pragueTime` i tak dalej), a przejście na [[proof-of-stake|proof of stake]] wyznacza terminal total difficulty (próg łącznej trudności kopania). Dla znanych sieci ta tabela jest wkompilowana w [[execution-client|klienta wykonawczego]] i wybiera się ją flagą, na przykład `--mainnet` albo `--sepolia`; dla własnej sieci pochodzi z pliku: `genesis.json` w klientach w stylu [[geth|Geth]] albo chainspec w [[nethermind|Nethermind]].",
          "Niezgodna konfiguracja nie daje błędu przy starcie. Oba węzły działają bez problemu aż do spornego punktu aktywacji, potem stosują różne reguły, obliczają inny [[state-root|state root]] i się rozjeżdżają. Dlatego checklista przed aktualizacją to wersja klienta i harmonogram forków, i dlatego [[health-check|health checki]] godne tej nazwy sprawdzają łańcuch, a nie tylko port."
        ]
      },
      {
        heading: "Genesis przez RPC",
        paragraphs: [
          "[[block-tag|Tag bloku]] `earliest` i `eth_getBlockByNumber` z `0x0` zwracają blok genesis; `eth_chainId` zwraca skonfigurowany chain ID, a `net_version` identyfikator sieci (network ID). Na mainnecie i głównych testnetach te dwie wartości są równe, ale to osobne ustawienia i na niektórych łańcuchach się różnią. Tylko pierwszą z tych odpowiedzi, blok genesis, trudno przypadkiem sfałszować: źle skonfigurowany węzeł może zgłaszać oczekiwany chain ID, a serwować inny łańcuch. Porównanie hasha genesis to więc najmocniejsze tanie sprawdzenie tożsamości sieci, jakie może zrobić aplikacja, i warto je robić przy dodawaniu nowego [[rpc-provider|providera]] albo nowego [[testnets|testnetu]].",
          "Sieci deweloperskie mocno opierają się na genesis. [[local-devnet|Lokalne węzły]] generują własny, z zasilonymi kontami i wszystkimi forkami aktywnymi od bloku 0, dlatego kontrakt działający lokalnie może zawieść na łańcuchu, na którym nowszy opcode nie jest jeszcze włączony."
        ]
      }
    ],
    pitfalls: [
      "Identyfikowanie sieci wyłącznie po `eth_chainId`; to wartość z konfiguracji, a hash genesis wynika z faktycznego łańcucha.",
      "Kopiowanie pliku genesis między klientami bez konwersji; `genesis.json` z Geth i chainspec Nethermind to różne formaty.",
      "Zakładanie, że harmonogram forków devnetu jest taki sam jak na mainnecie, co ukrywa błędy zależne od aktualizacji aż do wdrożenia.",
      "Zmiana konfiguracji łańcucha na działającym węźle w nadziei, że restart to naprawi; węzeł wypada z łańcucha przy pierwszej regule, która się różni."
    ]
  },
  "eip-7702": {
    title: "Transakcje set code (EIP-7702)",
    aliases: ["typ 0x4", "authorizationList", "delegation designator", "znacznik delegacji", "0xef0100", "delegacja EOA", "Pectra"],
    summary: "EIP-7702 dodaje transakcje typu `0x4`, działające od aktualizacji Pectra, których `authorizationList` kieruje [[account|konto EOA]] na [[smart-contract|smart kontrakt]]: [[eth-get-code|eth_getCode]] zwraca wtedy 23-bajtowy znacznik delegacji (delegation designator), czyli `0xef0100`, a po nim [[address|adres]] tego kontraktu.",
    sections: [
      {
        heading: "Co robi autoryzacja",
        paragraphs: [
          "Autoryzacja to mała podpisana krotka złożona z [[chain-id|chain ID]], adresu delegata i [[nonce|nonce]] konta autoryzującego (authority). Gdy wykonuje się [[transaction|transakcja]] typu `0x4`, która ją zawiera, w polu kodu konta autoryzującego zostaje zapisany znacznik `0xef0100 || address`, a jego nonce rośnie o jeden. Od tej chwili wywołanie tego konta uruchamia kod delegata we własnym kontekście konta, jak `DELEGATECALL`, więc zapisywany storage należy do konta, a nie do delegata. Podpisanie nowej autoryzacji dla adresu zerowego usuwa delegację.",
          "Ten, kto podpisuje autoryzację, nie musi sam wysyłać transakcji. Sponsor może zapłacić za cudzą delegację i właśnie o to chodzi: istniejące konto zyskuje zachowanie kontraktu, batchowanie wywołań i klucze sesyjne bez przenoszenia środków na nowy adres. Chain ID równe `0` sprawia, że autoryzacja jest ważna na każdym łańcuchu, a autoryzacja, której nonce już się nie zgadza, jest po cichu pomijana, zamiast powodować niepowodzenie transakcji."
        ]
      },
      {
        heading: "Co się zmienia dla wywołujących RPC",
        paragraphs: [
          "Najstarsza heurystyka w narzędziach Ethereum, „jest kod, to kontrakt; nie ma kodu, to konto EOA”, jest teraz błędna w obie strony. `eth_getCode` dla konta z delegacją zwraca dokładnie 23 bajty zaczynające się od `0xef0100`, a użyteczną odpowiedzią jest zawarty w nich adres, którego kod trzeba osobno pobrać, żeby wiedzieć, co konto faktycznie zrobi. [[eth-call|eth_call]] do takiego konta wykonuje kod delegata, a [[eth-get-storage-at|eth_getStorageAt]] czyta własne sloty konta, w których jest teraz stan kontraktu.",
          "Zmieniają się też sprawdzenia on-chain: konto kontrolowane kluczem może teraz mieć kod, czyli 23-bajtowy znacznik delegacji, więc warunek, który czyta „ma kod” jako „to kontrakt, a nie człowiek”, źle klasyfikuje konta z delegacją, a sprawdzenie `tx.origin == msg.sender` nie gwarantuje już, że nie działa żaden kod kontraktu. Konto z delegacją nadal może wysyłać zwykłe transakcje, więc obie ścieżki współistnieją, a same transakcje typu `0x4` nie mogą tworzyć kontraktów, bo pole `to` musi być ustawione."
        ]
      },
      {
        heading: "Związek z abstrakcją kont",
        paragraphs: [
          "[[erc-4337|ERC-4337]] daje zachowanie smart konta nowym kontom przez bundlery i kontrakt EntryPoint, całkowicie poza protokołem. EIP-7702 daje je kontom, które ludzie już mają, wewnątrz protokołu, i zwykle łączy się te dwa podejścia: portfel deleguje istniejące konto do implementacji, która obsługuje interfejs 4337. Dla każdego, kto czyta łańcuch, praktyczny skutek jest taki, że [[address|adres]], który rok temu był zwykłym nadawcą, dziś może wykonywać dowolny kod, więc możliwości konta trzeba sprawdzać dla każdego bloku, a nie trzymać w cache na zawsze."
        ]
      }
    ],
    pitfalls: [
      "Klasyfikowanie kont jako kontraktów lub nie na podstawie samego `eth_getCode`; 23-bajtowa odpowiedź zaczynająca się od `0xef0100` to delegacja, a nie kontrakt.",
      "Trzymanie adresu delegata w cache; późniejsza autoryzacja może go przekierować albo usunąć, więc trzeba go odczytać ponownie w bloku, który nas interesuje.",
      "Zakładanie, że konto, które podpisało autoryzację, zapłaciło też za transakcję; często wysyła ją sponsor.",
      "Oczekiwanie, że nieprawidłowa autoryzacja spowoduje niepowodzenie transakcji; zostaje pominięta, a reszta transakcji normalnie się wykonuje."
    ]
  },
  precompiles: {
    title: "Kontrakty prekompilowane (precompiles)",
    aliases: [
      "precompile",
      "precompiled contract",
      "kontrakt prekompilowany",
      "ecrecover",
      "0x01",
      "P256VERIFY",
      "EIP-2537",
      "RIP-7212",
      "movePrecompileToAddress"
    ],
    summary: "Kontrakty prekompilowane to funkcje wbudowane w każdego [[execution-client|klienta wykonawczego]] pod stałymi, niskimi [[address|adresami]], na przykład `ecrecover` pod `0x01` i operacje BLS12-381 od `0x0b` do `0x11`. Kontrakty wywołują je jak każdy inny kontrakt, ale wykonują się one jako kod natywny, wyceniany według wzoru, a nie jako bytecode [[evm|EVM]].",
    sections: [
      {
        heading: "Co jest pod niskimi adresami",
        paragraphs: [
          "Precompile to adres, pod którym klient, zamiast wczytać bytecode, uruchamia funkcję natywną. Kontrakt dociera do niego zwykłym `CALL` lub `STATICCALL`, przekazuje dane wejściowe jako calldata i odczytuje wynik jako return data, więc od strony wywołującego wygląda to jak każdy inny [[smart-contract|smart kontrakt]]. Precompile'y istnieją dla kryptografii, która zaimplementowana w bytecode EVM byłaby rujnująco droga. Pierwotny zestaw zajmuje adresy od `0x01` do `0x09`: `ecrecover`, `sha256`, `ripemd160`, identity (zwykła kopia danych) pod `0x04`, `modexp`, trzy operacje alt_bn128 (bn254), z których korzystają weryfikatory zk, oraz `blake2f`. Dencun dodał pod `0x0a` point evaluation KZG dla [[blob|blobów]].",
          "EIP-2537 z aktualizacji Pectra dodał siedem precompile'ów BLS12-381 pod adresami od `0x0b` do `0x11`: dodawanie w G1 i G2, mnożenie wieloskalarne (MSM) w G1 i G2, sprawdzenie pairingu oraz dwie funkcje mapowania na krzywą. Dzięki nim kontrakt może weryfikować [[bls-signature|podpisy BLS]] takie, jakich używa warstwa konsensusu. EIP-7951 z aktualizacji Fusaka umieścił następnie `P256VERIFY`, czyli weryfikację secp256r1 dla passkeys i sprzętowych enklaw bezpieczeństwa (secure enclaves), pod adresem `0x100`, co daje na mainnecie osiemnaście precompile'ów. Zestaw jest właściwością bloku: wywołanie `0x0b` w bloku sprzed aktualizacji Pectra trafia na puste konto i zwraca `0x`."
        ]
      },
      {
        heading: "Cena ze wzoru, błędy według konwencji",
        paragraphs: [
          "Każdy precompile nalicza [[gas|gas]] na podstawie danych wejściowych, a nie za instrukcję: `ecrecover` stałe 3000, `sha256` 60 plus 12 za każde 32-bajtowe słowo, identity 15 plus 3 za słowo, pairing bn254 45000 plus 34000 za parę, point evaluation 50000, `P256VERIFY` 6900. Wzory są regułami konsensusu i zmieniają się tylko przy aktualizacjach sieci: EIP-7883 z aktualizacji Fusaka mniej więcej potroił cenę `modexp` i podniósł jego minimum do 500 gasu, a EIP-7823 ograniczył każde z jego pól długości do 1024 bajtów, więc calldata, które działały przed aktualizacją, mogą po niej zawodzić.",
          "Błędy przybierają dwie postaci. Większość precompile'ów traktuje złe dane wejściowe, na przykład punkt spoza krzywej albo złą długość, jako exceptional halt (wyjątkowe zatrzymanie): wywołanie zużywa cały przekazany mu gas, a wywołujący widzi nieudane wywołanie. `ecrecover` i `P256VERIFY` zamiast tego kończą się sukcesem z pustym wynikiem, gdy podpis nie przechodzi weryfikacji, a `ecrecover` w Solidity zamienia ten pusty wynik na `address(0)`. Kod, który porównuje odzyskany adres podpisującego z zapisanym właścicielem (owner), którego nigdy nie ustawiono, akceptuje więc śmieciowe podpisy."
        ]
      },
      {
        heading: "Co widzą wywołujący RPC",
        paragraphs: [
          "Precompile'y nie mają kodu w [[state|stanie]], więc [[eth-get-code|eth_getCode]] zwraca dla każdego z nich `0x`, a sprawdzenie, czy adres ma kod, klasyfikuje je jako puste konta. [[eth-call|eth_call]] do precompile'a działa jak wywołanie dowolnego kontraktu i jest szybkim sposobem, żeby policzyć hash albo odzyskać adres podpisującego na węźle. EIP-2929 umieszcza każdy precompile w zbiorze adresów warm na starcie [[transaction|transakcji]], więc pierwsze wywołanie płaci za dostęp 100 gasu zamiast 2600, a wpisanie precompile'a do [[access-list|access listy]] wydaje 2400 gasu na nic. Delegacja [[eip-7702|EIP-7702]] na adres precompile'a uruchamia pusty kod, a nie precompile.",
          "Symulacja może je przenosić. [[eth-simulate|eth_simulateV1]] definiuje w [[state-override|state overrides]] pole `movePrecompileToAddress`: funkcja natywna zostaje przeniesiona, zanim zadziała jakiekolwiek nadpisanie `code`, więc pod `0x01` można zainstalować kod, który zwraca wybrany adres podpisującego, a prawdziwy `ecrecover` odpowiada wtedy pod nowym adresem. Geth akceptuje to pole także w `eth_call`. W [[execution-trace|trace'ach wykonania]] `callTracer` Getha zapisuje wywołania precompile'ów jako ramki, a wyjście [[trace-api|trace_]] w stylu Parity je pomija, więc liczba [[internal-transaction|wywołań wewnętrznych]] w tych dwóch formatach się różni."
        ]
      },
      {
        heading: "Rollupy dodają własne",
        paragraphs: [
          "Rollupy zachowują zestaw z Ethereum i dodają własne funkcje natywne. Arbitrum nazywa precompile'ami swoje kontrakty systemowe, `ArbSys` pod `0x64`, `ArbGasInfo` pod `0x6c` i inne z tego zakresu, oraz dodaje `NodeInterface` pod `0xc8`, którego w ogóle nie ma w łańcuchu i do którego można dotrzeć tylko przez wywołania RPC, takie jak `eth_call`, nigdy z kontraktu. Łańcuchy OP Stack dodały w aktualizacji Fjord `P256VERIFY` z RIP-7212 pod tym samym adresem `0x100`, a RIP-7212 wycenia go na 3450 gasu wobec 6900 na L1; ich kontrakty systemowe to natomiast [[predeploys|predeploye]], czyli zwykły bytecode, który `eth_getCode` zwraca. Lokalny fork z czystym EVM Ethereum nie ma żadnych dodatków rollupu, więc wywołania, które działają w prawdziwym łańcuchu, tam zawodzą; zobacz [[l2-rpc|różnice RPC na L2]]."
        ]
      }
    ],
    example: {
      title: "Precompile'y przez RPC: bez kodu, ale da się je wywołać",
      note: "Trzecia odpowiedź to udane wywołanie, a nie revert: `ecrecover` zgłasza zły podpis pustym wynikiem, który Solidity odczytuje jako `address(0)`. Spacje w danych wejściowych są tylko dla czytelności."
    },
    pitfalls: [
      "Traktowanie pustego wyniku z `ecrecover` lub `P256VERIFY` jak revertu; to udane wywołanie, którego wynik oznacza, że podpis nie przeszedł weryfikacji.",
      "Dodawanie adresów precompile'ów do access listy, co kosztuje 2400 gasu za każdy adres, który i tak jest warm.",
      "Zakładanie, że kontrakt wywołujący `0x100` działa na każdym łańcuchu; tam, gdzie nie ma tego precompile'a, wywołanie kończy się sukcesem z pustym wynikiem, co wygląda jak nieudana weryfikacja.",
      "Wywoływanie precompile'a w historycznym bloku z oczekiwaniem dzisiejszego zestawu; precompile'y dodane w późniejszym forku są przed nim pustymi kontami.",
      "Odtwarzanie calldata dla `modexp` sprzed aktualizacji Fusaka ze starym limitem gasu, choć przy tej aktualizacji zmieniła się zarówno cena, jak i ograniczenia danych wejściowych."
    ]
  },
  "transient-storage": {
    title: "Transient storage (EIP-1153)",
    aliases: [
      "EIP-1153",
      "TSTORE",
      "TLOAD",
      "słowo kluczowe transient",
      "transient reentrancy guard",
      "flash accounting",
      "pamięć przejściowa"
    ],
    summary: "Transient storage to osobny dla każdego kontraktu magazyn klucz-wartość, dodany przez EIP-1153 w Dencun, zapisywany przez `TSTORE` i odczytywany przez `TLOAD`. Przez czas trwania jednej [[transaction|transakcji]] zachowuje się jak [[contract-storage|storage]], a potem jest odrzucany, więc nigdy nie trafia do trie [[state|stanu]] ani do żadnego odczytu RPC.",
    sections: [
      {
        heading: "Storage na czas jednej transakcji",
        paragraphs: [
          "EIP-1153 dało każdemu kontraktowi obok storage drugą mapę z 2 do potęgi 256 slotów, dostępną przez dwa opcode'y: `TLOAD` (`0x5c`) i `TSTORE` (`0x5d`). Każdy kosztuje stałe 100 [[gas|gasu]], bez rozróżnienia na cold i warm i bez refundów. Wartości przetrwają wszystkie wywołania tego kontraktu do końca transakcji, więc kontrakt może ustawić flagę w jednej ramce i odczytać ją w ramce wywołanej ponownie (reentrancy). Gdy transakcja się kończy, wszystko jest usuwane, a następna transakcja zaczyna z każdym slotem równym zero.",
          "Pod każdym innym względem zachowuje się jak storage. Ramka, która robi [[revert|revert]], cofa swoje zapisy transient razem z zapisami do storage, `TSTORE` wewnątrz `STATICCALL` kończy się błędem, tak jak każdy zapis stanu, a przy `DELEGATECALL` sloty należą do kontraktu wywołującego, dzięki czemu [[proxy-contract|proxy]] i jego implementacja mogą je współdzielić. Solidity udostępnia go przez inline assembly, a od wersji 0.8.28 także przez zmienne stanu `transient` typów wartościowych, których numeracja slotów jest niezależna od zwykłego storage."
        ]
      },
      {
        heading: "Do czego się go używa",
        paragraphs: [
          "Pierwsze zastosowanie to blokada przed reentrancy. W zwykłym storage blokada, która w jednej transakcji przechodzi z 0 na 1 i z powrotem na 0, kosztuje w trakcie działania ponad 22 000 gasu, a 19 900 z tego odzyskuje dopiero na końcu jako [[gas-refunds|refund]], i to w granicach limitu refundów; jeden `TLOAD` i dwa `TSTORE` kosztują 300. Właśnie do tego używają go `ReentrancyGuardTransient` z OpenZeppelin i wzorzec blokady opisany w dokumentacji Solidity.",
          "Drugie zastosowanie to rozliczenia, które muszą się zbilansować, zanim wywołanie się zakończy. `PoolManager` z Uniswap v4 zapisuje w transient storage delty każdego wywołującego dla każdej waluty podczas callbacku `unlock` i robi revert z `CurrencyNotSettled`, jeśli po zakończeniu `unlock` choć jedna delta nie wróciła do zera, więc swap przez wiele pul (multi-hop) rozlicza tokeny raz, a nie na każdym etapie. Mniejsze zastosowania to przekazywanie kontekstu z routera do wywoływanego kodu bez poszerzania sygnatury funkcji oraz zgody na wydawanie tokenów (approvals), które nie mogą przetrwać dłużej niż transakcja."
        ]
      },
      {
        heading: "Niewidoczny dla odczytów stanu i dowodów",
        paragraphs: [
          "Wartości transient nigdy nie są zapisywane do trie, więc nic, co czyta stan, ich nie widzi. [[eth-get-storage-at|eth_getStorageAt]] zwraca trwały slot nawet wtedy, gdy zmienna `transient` ma ten sam numer slotu, a [[eth-get-proof|eth_getProof]] nie udowodni wartości transient, bo żaden [[state-root|state root]] nie zawiera do niej commitmentu; [[storage-proof|dowód storage]] dla tego numeru slotu dowodzi wartości trwałej. Po zakończeniu transakcji jedynym sposobem, żeby poznać zawartość slotu transient, jest ponowne wykonanie transakcji.",
          "Symulacja za każdym razem zaczyna od czystej karty. Każde [[eth-call|eth_call]] działa jako osobna transakcja, więc blokada albo delta ustawiona przez jedno wywołanie znika przed następnym, a [[state-override|state overrides]] nie mają pola dla slotów transient. W [[eth-simulate|eth_simulateV1]] każde wywołanie w symulowanym bloku również jest osobną transakcją, więc wartości transient zerują się między wywołaniami w tym samym bloku, dokładnie tak jak między transakcjami w prawdziwym bloku."
        ]
      },
      {
        heading: "Tracing i batche",
        paragraphs: [
          "Zapisy transient nie tworzą state diffu, więc większość [[execution-trace|trace'ów wykonania]] je pomija. `prestateTracer` Getha i mapa `storage` dla każdego kroku w jego loggerze opcode'ów powstają wyłącznie z `SLOAD` i `SSTORE`, a tracery na poziomie wywołań w ogóle nie pokazują storage. Aktywność transient widać tylko w trace opcode'ów z [[debug-api|debug_traceTransaction]], jako kroki `TLOAD` i `TSTORE` z kluczem i wartością na stosie.",
          "Skoro wartości trwają przez całą transakcję, wszystko, co zostało do niej spakowane, współdzieli te sloty: kilka wywołań przez [[multicall|Multicall]], kilka [[erc-4337|UserOperation]] w jednym bundlu albo batch wykonywany przez konto z delegacją [[eip-7702|EIP-7702]] widzą nawzajem swoje sloty transient. Kontrakt, który ustawia flagę transient i zapomina ją wyczyścić, przenosi tę flagę do następnej operacji w batchu."
        ]
      }
    ],
    example: {
      title: "Blokada transient obok zwykłego storage",
      note: "Obie zmienne leżą w slocie 0 swojej mapy, więc przeniesienie zmiennej do `transient` przesuwa sloty storage wszystkiego, co zadeklarowano po niej."
    },
    pitfalls: [
      "Oczekiwanie, że `eth_getStorageAt` albo `eth_getProof` zwróci wartość transient; obie metody czytają trie, które nigdy jej nie zawiera.",
      "Zostawianie ustawionej flagi transient na końcu wywołania; przecieka ona do kolejnych wywołań w tej samej transakcji, na przykład do następnej operacji w bundlu.",
      "Zakładanie, że blokada transient przetrwa między dwoma żądaniami `eth_call` albo między dwoma wywołaniami w bloku `eth_simulateV1`; każde zaczyna od zera.",
      "Wdrażanie kontraktu, który używa `TSTORE`, na łańcuchu bez aktywnego EIP-1153, gdzie `0x5c` i `0x5d` to nieprawidłowe opcode'y, a każde wywołanie kończy się błędem.",
      "Debugowanie wartości transient na podstawie diffu prestate, który je pomija; tylko trace opcode'ów pokazuje `TLOAD` i `TSTORE`."
    ]
  },
  "gas-refunds": {
    title: "Refundy gasu i reguła 63/64",
    aliases: [
      "refund gasu",
      "zwrot gasu",
      "gas refund",
      "EIP-3529",
      "limit refundu",
      "refund SSTORE",
      "reguła 63/64",
      "63/64 rule",
      "EIP-150",
      "calldata floor",
      "EIP-7623"
    ],
    summary: "Refundy gasu (zwroty gasu) oddają część [[gas|gasu]] wydanego przez [[transaction|transakcję]], głównie za czyszczenie storage, ale dopiero po zakończeniu wykonania i najwyżej do jednej piątej zużytego gasu. Właśnie przez to, razem z regułą 63/64 z EIP-150, transakcja potrzebuje wyższego limitu niż `gasUsed`, które pokazuje jej [[transaction-receipt|receipt]].",
    sections: [
      {
        heading: "Co jest zwracane i kiedy",
        paragraphs: [
          "Podczas wykonania [[evm|EVM]] prowadzi licznik refundów. `SSTORE` dodaje do niego 4800, gdy czyści slot, który na początku transakcji był niezerowy, i więcej, gdy przywraca slot do wartości początkowej: 19 900, gdy ta wartość była zerowa, i 2800, gdy nie była. Późniejsze zapisy mogą znów odejmować, na przykład gdy slot wyczyszczony wcześniej w tej samej transakcji dostaje niezerową wartość. [[eip-7702|EIP-7702]] dodaje 12 500 za każdą autoryzację, której konto już istniało, bo opłata intrinsic zakładała nowe konto. W trakcie wykonania nic nie jest zwracane; każdy opcode jest rozliczany w całości.",
          "Na koniec klient bierze gas zużyty do tej pory, ogranicza licznik do jednej piątej tej wartości i odejmuje wynik. Limit jednej piątej to EIP-3529 z hard forka London, który obniżył też refund za wyczyszczenie slotu z 15 000 do 4800 i usunął refund za `SELFDESTRUCT`. Wcześniej limit wynosił połowę, a GasToken zapełniał storage, gdy gas był tani, i czyścił go, gdy był drogi. Ta pomniejszona wartość jest tym, za co płaci nadawca, co receipt pokazuje jako `gasUsed` i co wlicza się do `gasUsed` [[block-header|bloku]], więc nagłówek zaniża pracę, którą wykonały jego transakcje."
        ]
      },
      {
        heading: "Dlaczego limit musi przewyższać receipt",
        paragraphs: [
          "Refundy przychodzą po ostatniej instrukcji, więc transakcję musi być najpierw stać na każdą instrukcję. Zadanie, które zużywa 120 000 gasu i czyści siedem slotów, zbiera w liczniku 33 600, co zostaje ograniczone do 24 000, i raportuje `gasUsed` równe 96 000. Wysłane ponownie z limitem 96 000 wyczerpie gas na długo przed powstaniem jakiegokolwiek refundu. Dla wszystkiego, co czyści [[contract-storage|storage]], receipt z jednego przebiegu jest dolnym ograniczeniem tego, czego potrzebuje następny przebieg, a nigdy górnym.",
          "Reguła 63/64 z EIP-150 dokłada do tego dodatkowy zapas. `CALL` przekazuje najwyżej cały gas, który został wywołującemu, bez jego 64. części, więc wywoływany kontrakt, który potrzebuje 100 000 gasu, jest osiągalny tylko wtedy, gdy wywołujący ma w tym momencie około 101 600, a zatrzymana 64. część zwykle w ogóle nie zostaje wydana. Rezerwy z kolejnych poziomów zagnieżdżenia się kumulują, a kontrakty, które przed działaniem sprawdzają `gasleft()`, jak [[transaction-relayer|relayery]] i EntryPoint z [[erc-4337|ERC-4337]], wymagają zapasu, którego ich własne wykonanie nigdy nie zużywa."
        ]
      },
      {
        heading: "Jak radzi sobie estymacja",
        paragraphs: [
          "[[eth-estimate-gas|eth_estimateGas]] nie odczyta potrzebnego limitu z jednego przebiegu, bo ani `gasUsed`, ani szczytowe zużycie nie pokazują zatrzymanych 64. części ani jawnych sprawdzeń `gasleft()`, więc klienci szukają go w kilku przebiegach. [[geth|Geth]] uruchamia wywołanie raz z najwyższym dozwolonym limitem i odpowiada `gas required exceeds allowance`, jeśli nawet wtedy zabraknie gasu. Jako pierwszą próbę bierze 64/63 szczytowego zużycia, a potem szuka binarnie między limitem nieudanym a udanym i kończy, gdy przedział zawęzi się do 1,5 procent. Odpowiedź to limit, celowo wyższy niż późniejsze `gasUsed`, i ważny tylko dla jednego stanu.",
          "[[eth-simulate|eth_simulateV1]] podaje dla każdego wywołania obie wartości: `gasUsed` po refundach oraz, w obecnej specyfikacji, `maxUsedGas`, czyli zużycie przed refundami. Ta druga to dolna granica limitu, ale wciąż za mało wszędzie tam, gdzie wywołanie przekazuje gas dalej, więc symulator, który ustawia limity na jej podstawie, sam dolicza zatrzymane 64. części."
        ]
      },
      {
        heading: "Minimalny koszt calldata",
        paragraphs: [
          "EIP-7623 z hard forka Pectra przesuwa `gasUsed` w drugą stronę dla transakcji z dużą ilością danych. Calldata liczy się w tokenach, jeden na każdy bajt zerowy i cztery na każdy niezerowy, a transakcja płaci większą z dwóch kwot: 21 000 plus 4 gasu za token plus jej gas na wykonanie i tworzenie kontraktu, już po odjęciu refundów, albo 21 000 plus 10 gasu za token. Transakcja z dużym payloadem i niewielkim wykonaniem raportuje więc `gasUsed` wyższe niż to, co zużyła EVM, i płaci za tę różnicę. Jej limit musi wynosić co najmniej tyle, ile to minimum (calldata floor), inaczej transakcja jest nieważna, a żaden refund nie sprowadzi opłaty poniżej tego minimum."
        ]
      }
    ],
    example: {
      title: "Jedno zadanie, trzy różne liczby gasu",
      note: "Receipt pokazuje najmniejszą z tych trzech liczb i to właśnie ją kopiuje naiwne ponowne wysłanie."
    },
    pitfalls: [
      "Ustawianie limitu gasu na podstawie `gasUsed` z poprzedniego receiptu dla transakcji, która czyści storage; gas kończy się, zanim refund zostanie naliczony.",
      "Oczekiwanie refundu większego niż jedna piąta zużytego gasu; od hard forka London reszta licznika po prostu przepada.",
      "Traktowanie `gasUsed` bloku jako miary wykonanej pracy, choć każda transakcja w tym bloku ma już odjęty refund.",
      "Wysyłanie niezmienionej estymacji do kontraktu, który sprawdza `gasleft()`, gdzie niewielka zmiana stanu przesuwa wymagany zapas ponad tę estymację.",
      "Zakładanie, że `gasUsed` nigdy nie przekracza tego, co zużyło wykonanie; przy minimalnym koszcie calldata transakcja z dużą ilością danych płaci więcej."
    ]
  },
  "execution-requests": {
    title: "Żądania warstwy wykonawczej (EIP-7685)",
    aliases: [
      "żądania warstwy wykonawczej",
      "execution requests",
      "EIP-7685",
      "requestsHash",
      "executionRequests",
      "EIP-6110",
      "EIP-7002",
      "EIP-7251",
      "żądania depozytu",
      "deposit requests",
      "żądania wypłaty",
      "consolidation requests",
      "konsolidacja walidatorów"
    ],
    summary: "Żądania warstwy wykonawczej to zdefiniowane w EIP-7685 i działające od Pectry wiadomości, które [[block|blok]] wykonawczy przekazuje [[consensus-layer|warstwie konsensusu]]: depozyty walidatorów, żądania wypłaty i wyjścia oraz konsolidacje. Nagłówek zawiera do nich commitment w polu `requestsHash`, a do klienta konsensusu trafiają przez [[engine-api|Engine API]].",
    sections: [
      {
        heading: "Trzy rodzaje żądań",
        paragraphs: [
          "Niektóre operacje stakingowe zaczynają się od wywołania kontraktu w warstwie wykonawczej, a skutek muszą mieć w stanie beacon. EIP-7685 daje im wspólny format (envelope): żądanie to bajt typu, po którym następują dane, których ten format nie interpretuje. Typ `0x00` to depozyt (EIP-6110): 192 bajty klucza publicznego, withdrawal credentials, kwoty, podpisu i indeksu, pobrane z [[event-log|logów]] `DepositEvent` kontraktu depozytowego pod adresem `0x00000000219ab540356cBB839Cbe05303d7705Fa` w kolejności ich emitowania. Ten mechanizm zastąpił stare głosowanie eth1-data, w którym warstwa konsensusu śledziła kontrakt depozytowy z opóźnieniem wielu godzin względem head.",
          "Typ `0x01` to żądanie wypłaty (EIP-7002): 76 bajtów adresu źródłowego, klucza publicznego walidatora i kwoty, przy czym kwota zero oznacza prośbę o pełne wyjście. Dzięki niemu adres zapisany w withdrawal credentials [[validator|walidatora]] może wywołać wyjście albo wypłatę częściową bez klucza podpisującego. Typ `0x02` to żądanie konsolidacji (EIP-7251): 116 bajtów adresu źródłowego i dwóch kluczy publicznych. Scala jednego walidatora z drugim albo, gdy źródło jest równe celowi, przełącza jego credentials na `0x02` z kapitalizacją nagród (compounding). Oba typy żądań składa się, wywołując [[system-contracts|kontrakty systemowe]] pod adresami `0x00000961Ef480Eb55e80D19ad83579A64c007002` i `0x0000BBdDc7CE488642fb579F8B00f3a590007251`, które pobierają opłatę rosnącą wraz z popytem. EIP-8282 z Glamsterdam dodaje dwa kolejne typy dla builderów w [[enshrined-pbs|enshrined PBS]]: typ `0x03`, czyli depozyty builderów, i typ `0x04`, czyli wyjścia builderów, każdy składany przez własny kontrakt systemowy. Działają tylko na Sepolii, gdzie Glamsterdam aktywowano 6 października 2026, a na Hoodi i mainnecie jeszcze nie."
        ]
      },
      {
        heading: "Jak blok je wytwarza",
        paragraphs: [
          "Depozyty są parsowane z receiptów bloku po wykonaniu jego transakcji. Pozostałe dwa typy pochodzą z wywołań systemowych: po ostatniej transakcji klient wywołuje każdy kontrakt systemowy z adresu `0xfffffffffffffffffffffffffffffffffffffffe`, z własnym przydziałem gasu poza limitem bloku, a kontrakt zwraca ze swojej kolejki do 16 żądań wypłaty albo do 2 żądań konsolidacji. Żądanie złożone w jednym bloku może więc zostać zdjęte z kolejki w późniejszym, a log, który kontrakt emituje przy jego przyjęciu, nie dowodzi zdjęcia z kolejki.",
          "Commitment do wyniku zawiera [[block-header|nagłówek]]. `requestsHash` to SHA-256 z połączonych hashy SHA-256 bajtów każdego niepustego typu, w rosnącej kolejności typów, a blok bez żądań ma SHA-256 pustego ciągu, `0xe3b0c442…b855`. W Engine API lista jest przesyłana obok payloadu: `engine_getPayloadV4`, a od Osaki `engine_getPayloadV5`, zwraca `executionRequests`, a `engine_newPayloadV4` przyjmuje ją jako czwarty parametr, po jednym ciągu bajtów na każdy niepusty typ. Klient wykonawczy musi odtworzyć tę listę, wykonując blok, zanim odpowie `VALID`; zobacz [[engine-payload|metody Engine API]]."
        ]
      },
      {
        heading: "Odczytywanie ich przez RPC",
        paragraphs: [
          "Obiekt bloku w JSON-RPC ma `requestsHash` i nic więcej: [[eth-get-block-by-number|eth_getBlockByNumber]] nie zwraca listy żądań, a wywołanie systemowe nie zostawia receiptu, bo nie jest [[transaction|transakcją]]. Depozyty to łatwy przypadek, bo żądania to dokładnie logi `DepositEvent` kontraktu depozytowego i [[eth-get-logs|eth_getLogs]] je znajdzie. Żądania wypłaty i konsolidacji są widoczne po stronie wykonawczej tylko jako transakcja, która je złożyła, i `LOG0` bez żadnych topics, który każdy kontrakt systemowy emituje przy przyjęciu żądania; znajdzie go filtr logów ustawiony tylko na adres.",
          "Miarodajna lista jest w [[beacon-block|bloku beacon]]: ścieżka bloku w [[beacon-endpoints|Beacon API]] zwraca `body.execution_requests` z polami `deposits`, `withdrawals` i `consolidations` i właśnie to powinien czytać [[indexer|indekser]] aktywności stakingowej. Opłatę da się odczytać po stronie wykonawczej: [[eth-call|eth_call]] do dowolnego z tych kontraktów systemowych z pustymi danymi wejściowymi zwraca bieżącą opłatę jako 32-bajtowe słowo."
        ]
      },
      {
        heading: "Czego warstwa wykonawcza nie sprawdza",
        paragraphs: [
          "Przyjęcie przez kontrakt systemowy to nie przyjęcie przez warstwę konsensusu. Kontrakt wypłat sprawdza tylko opłatę i długość danych wejściowych; warstwa konsensusu po cichu ignoruje potem żądanie, którego adres źródłowy nie pasuje do credentials walidatora, którego walidator jest nieaktywny albo już wychodzi, albo które prosi o wypłatę częściową bez credentials compounding. Receipt ma `status` `0x1`, opłata przepada tak czy inaczej, a nadpłata nie jest zwracana. Żeby sprawdzić skutek, trzeba odczytać walidatora z [[beacon-api|Beacon API]], a ewentualna wypłata i tak przychodzi później jako zwykła [[withdrawals|wypłata]]."
        ]
      }
    ],
    example: {
      title: "Źródło każdego typu żądania i commitment w nagłówku",
      note: "Hash to SHA-256, jak po stronie konsensusu, a nie Keccak-256; jeden bajt nie na swoim miejscu na liście zmienia `requestsHash`, a więc i hash bloku."
    },
    pitfalls: [
      "Szukanie tablicy żądań w bloku wykonawczym; jest tam tylko `requestsHash`, a lista znajduje się w bloku beacon.",
      "Traktowanie udanej transakcji do kontraktu żądań wypłaty jako zaplanowanego wyjścia; warstwa konsensusu może ją odrzucić bez żadnego śladu po stronie wykonawczej.",
      "Zakładanie, że żądanie zadziała w bloku, który je złożył; kolejki zwalniają najwyżej 16 żądań wypłaty i 2 żądania konsolidacji na blok.",
      "Płacenie dokładnie opłaty odczytanej blok wcześniej; jeśli opłata wzrośnie przed włączeniem do bloku, transakcja kończy się revertem, a każda nadpłata przepada.",
      "Przeliczanie `requestsHash` za pomocą Keccak-256; commitment używa SHA-256."
    ]
  },
  "proxy-contract": {
    title: "Kontrakty proxy",
    aliases: [
      "upgradeable proxy",
      "proxy z możliwością aktualizacji",
      "EIP-1967",
      "UUPS",
      "transparent proxy",
      "beacon proxy",
      "EIP-1167",
      "minimal proxy",
      "diamond"
    ],
    summary: "Kontrakt proxy to mały [[smart-contract|smart kontrakt]], który każde wywołanie przekazuje przez `DELEGATECALL` do adresu implementacji przechowywanego w swoim [[contract-storage|storage]], dzięki czemu jego [[address|adres]], saldo i storage się nie zmieniają, a kod, który się wykonuje, można wymienić.",
    sections: [
      {
        heading: "Delegowanie i standardowe sloty",
        paragraphs: [
          "Funkcja fallback proxy kopiuje calldata, wykonuje `DELEGATECALL` do implementacji i zwraca albo revertuje dokładnie to, co dostała z powrotem. `DELEGATECALL` uruchamia kod implementacji w kontekście proxy, więc `msg.sender`, `msg.value`, zapisy do storage i emitowane [[event-log|eventy]] należą do proxy; implementacja to tylko kod, a jej własny storage nie ma znaczenia. Aktualizacja kontraktu (upgrade) sprowadza się do wpisania nowego adresu do jednego slotu.",
          "EIP-1967 ustandaryzował ten slot, żeby narzędzia mogły go znaleźć bez kodu źródłowego. Implementacja leży w `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`, czyli `keccak256('eip1967.proxy.implementation') - 1`, admin w `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`, a adres beacona w beacon proxy w `0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50`. Zmiany emitują `Upgraded(address indexed implementation)` (topic `0xbc7cd75a…2d3b`) oraz `AdminChanged` i `BeaconUpgraded`. Starsze proxy powstały przed standardem: `FiatTokenProxy` od USDC trzyma implementację pod `keccak256('org.zeppelinos.proxy.implementation')`, czyli `0x7050c9e0…f8c3`, a jego slot EIP-1967 odczytuje się jako zero."
        ]
      },
      {
        heading: "Wzorce",
        paragraphs: [
          "Transparent proxy sam zawiera funkcję aktualizacji i kieruje wywołania według wywołującego: admin dociera tylko do ścieżki aktualizacji, a wszyscy pozostali są zawsze przekazywani dalej, więc selektor wspólny dla proxy i implementacji nie może złapać użytkownika w pułapkę. Proxy UUPS (ERC-1822) umieszcza funkcję aktualizacji w implementacji, co zmniejsza samo proxy, ale oznacza, że aktualizacja do implementacji bez tej funkcji na zawsze zamraża proxy; UUPS w wydaniu OpenZeppelin nadal przechowuje adres w slocie EIP-1967. Beacon proxy przechowuje adres beacona, którego `implementation()` odpowiada za wiele proxy naraz, więc jedna aktualizacja przestawia je wszystkie.",
          "Często zalicza się tu też dwa pokrewne wzorce. Minimal proxy z EIP-1167, czyli klon, to 45 bajtów kodu runtime z wbudowanym adresem docelowym: `363d3d373d3d3d363d73`, potem adres, potem `5af43d82803e903d91602b57fd5bf3`. Deleguje jak proxy, nie da się go zaktualizować, a jego cel ujawnia już samo [[eth-get-code|eth_getCode]]. Diamond (EIP-2535) kieruje każdy czterobajtowy selektor do osobnego kontraktu (facet), przy zmianach emituje `DiamondCut` i odpowiada na `facetAddress(bytes4)`, więc nie ma jednego slotu implementacji do odczytania."
        ]
      },
      {
        heading: "Odczyty historyczne idą za implementacją",
        paragraphs: [
          "[[eth-call|eth_call]] w bloku N wykonuje tę implementację, którą slot zawierał po bloku N. Wywołanie z tymi samymi calldata może na różnych wysokościach zwrócić różne wartości, różne powody [[revert|revertu]] albo nic, a [[abi|ABI]], które dekoduje dzisiejszą odpowiedź, może nie zdekodować zeszłorocznej, bo aktualizacje dodają, usuwają i zmieniają nazwy funkcji i eventów. Żeby wiedzieć, który kod odpowiedział, trzeba odczytać slot przez [[eth-get-storage-at|eth_getStorageAt]] w tym samym bloku, a potem pobrać kod i ABI tej implementacji; logi `Upgraded` z [[eth-get-logs|eth_getLogs]] dają oś czasu dla proxy, które je emitują.",
          "Historia przechowywana dla wybranego zbioru kontraktów musi uwzględniać ten sam ciąg implementacji. [[partial-archive|Częściowe archiwum]] ograniczone do adresu proxy nie odtworzy dawnego wywołania, jeśli nie ma też kodu implementacji, która była wtedy ustawiona, i stanu wszystkiego, co ten kod wywołuje, a zbiór implementacji rośnie z każdą aktualizacją. [[indexer|Indekser]], który dekoduje eventy proxy, ma ten sam problem w miniaturze: [[event-signature|sygnatury eventów]] mogą się zmienić przy aktualizacji, więc dekoder musi przełączyć ABI w bloku z eventem `Upgraded`."
        ]
      },
      {
        heading: "Co widzą narzędzia",
        paragraphs: [
          "[[block-explorer|Eksploratory bloków]] sprawdzają standardowe sloty i wzorzec klona i oferują opcję read as proxy, która stosuje ABI implementacji do adresu proxy; zweryfikowany kod źródłowy pod adresem proxy opisuje tylko kod przekazujący. W [[execution-trace|trace'ach wykonania]] jedno wywołanie proxy to dwie ramki: `CALL` do proxy i `DELEGATECALL` z proxy do implementacji, więc narzędzia do [[internal-transaction|wywołań wewnętrznych]], które ignorują `DELEGATECALL`, nie widzą, gdzie wykonała się logika. Wynik [[eth-create-access-list|eth_createAccessList]] dla wywołania przez proxy zawiera slot implementacji, bo każde przekazane wywołanie go odczytuje."
        ]
      }
    ],
    example: {
      title: "Która implementacja odpowiedziała kiedyś, a która teraz",
      note: "`eth_call` w bloku `0x12d4f1c` wykonał kod `0x4351…9f1c`, więc do zdekodowania odpowiedzi potrzebne jest ABI tej implementacji, a nie obecnej."
    },
    pitfalls: [
      "Dekodowanie historycznych wywołań lub logów za pomocą ABI dzisiejszej implementacji, mimo aktualizacji, które po drodze zmieniły funkcje albo eventy.",
      "Odczytywanie tylko slotu implementacji EIP-1967; proxy sprzed standardu, takie jak to od USDC, używają innych slotów, a diamondy i klony nie używają żadnego.",
      "Traktowanie zweryfikowanego kodu źródłowego pod adresem proxy jako logiki kontraktu; to kod przekazujący, a zachowanie jest zdefiniowane w implementacji.",
      "Oczekiwanie, że storage implementacji przechowuje stan proxy; przy `DELEGATECALL` każdy zapis trafia do proxy.",
      "Przechowywanie historii tylko dla adresu proxy, co nie pozwala odtworzyć dawnych wywołań bez implementacji i kontraktów, które ona wywołuje."
    ]
  },
  "transaction-lifecycle": {
    title: "Cykl życia transakcji",
    aliases: [
      "utknięta transakcja",
      "stuck transaction",
      "wyrzucona transakcja",
      "dropped transaction",
      "zastąpiona transakcja",
      "status transakcji",
      "ponowne rozgłoszenie",
      "przyspieszenie transakcji",
      "anulowanie transakcji"
    ],
    summary: "Cykl życia transakcji to ciąg etapów, przez które przechodzi ona po [[eth-send-raw-transaction|eth_sendRawTransaction]]: pending albo queued w mempoolach, potem zastąpiona, wyrzucona albo włączona do bloku, ewentualnie usunięta przez reorg, a na końcu sfinalizowana. Żadna pojedyncza metoda RPC nie podaje, na którym z tych etapów jest transakcja.",
    sections: [
      {
        heading: "Przyjęta przez jeden węzeł",
        paragraphs: [
          "Hash zwrócony przez `eth_sendRawTransaction` to Keccak-256 wysłanych bajtów, a udana odpowiedź oznacza jedno: [[mempool|mempool]] jednego węzła je przyjął. Węzeł rozgłasza następnie transakcję do peerów, z których każdy stosuje własne reguły przyjmowania, więc może ona dotrzeć do większości sieci albo do nikogo, jeśli wyszła z węzła bez peerów lub z backendu providera, który nigdy jej nie przekazuje dalej. Za load balancerem backend, który ją przyjął, może nie być tym, który odpowie na następne zapytanie.",
          "W mempoolu transakcja jest pending, jeśli jej [[nonce|nonce]] jest następnym nonce nadawcy albo bez luki następuje po innych transakcjach pending, a queued, jeśli brakuje niższego nonce. Pending nie znaczy, że może trafić do bloku: `maxFeePerGas` poniżej bieżącej [[eip-1559|base fee]] każe jej czekać, aż base fee spadnie. Transakcja queued czeka na wypełnienie luki, a [[geth|Geth]] wyrzuca transakcje queued po czasie `--txpool.lifetime`, domyślnie po trzech godzinach."
        ]
      },
      {
        heading: "Zastąpiona, wyrzucona albo włączona",
        paragraphs: [
          "Czekanie kończy się na trzy sposoby. Zastąpienie: inna transakcja tego samego nadawcy z tym samym nonce i dostatecznie wysoką opłatą zajmuje jej miejsce. W Geth domyślnie trzeba podnieść opłatę o dziesięć procent w obu polach opłat, a dla transakcji blobowych o sto procent. Mempoole, które widziały zastąpienie, zapominają stary hash. Wyrzucenie: mempool usunął ją z braku miejsca albo ze względu na wiek, albo węzeł się zrestartował, a Geth prowadzi journal na dysku tylko dla transakcji wysłanych przez jego własne RPC. Włączenie: blok ją zawiera i istnieje [[transaction-receipt|receipt]].",
          "Bezpośrednio da się zaobserwować tylko włączenie. Żadna metoda nie zgłasza zastąpienia ani wyrzucenia, a [[eth-subscribe|eth_subscribe]] z `newPendingTransactions` ogłasza przybycia, ale nigdy odejścia, więc jedno i drugie trzeba wywnioskować. Wyrzucona transakcja nie jest też anulowana: pozostaje ważna, dopóki jej nonce nie zostanie użyty, a każdy, kto ma podpisane bajty, w tym peer, który ją zachował, może doprowadzić do jej włączenia do bloku nawet po kilku dniach. Jedynym prawdziwym anulowaniem jest inna transakcja, która zużyje ten nonce."
        ]
      },
      {
        heading: "Jak odróżnić etapy",
        paragraphs: [
          "Trzy wywołania na jednym węźle rozróżniają te przypadki. [[eth-get-transaction-by-hash|eth_getTransactionByHash]] zwraca obiekt z `blockNumber` równym null, dopóki węzeł trzyma transakcję w mempoolu, numer bloku po włączeniu i `null`, gdy węzeł już o niej zapomniał. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] zwraca `null` aż do włączenia. [[eth-get-transaction-count|eth_getTransactionCount]] rozstrzyga niejednoznaczne `null`: jeśli licznik przy `latest` przekroczył nonce transakcji, a jej hash nie ma receiptu, nonce zużyła inna transakcja i tej nigdy nie da się włączyć do bloku; jeśli zarówno przy `latest`, jak i przy `pending` licznik wciąż równa się jej nonce, ten węzeł ją wyrzucił i trzeba ją ponownie rozgłosić.",
          "Nie ma standardowej metody na znalezienie transakcji, która faktycznie zajęła ten nonce. `ots_getTransactionBySenderAndNonce` z [[otterscan|Otterscan]], obsługiwane przez Erigon i [[reth|Reth]], oraz `eth_getTransactionBySenderAndNonce` z Reth odpowiadają na to bezpośrednio; gdzie indziej trzeba przeszukać ostatnie bloki nadawcy albo zapytać [[indexer|indeksera]]."
        ]
      },
      {
        heading: "Po włączeniu do bloku",
        paragraphs: [
          "Włączenie jest tymczasowe. [[reorg|Reorg]] (reorganizacja łańcucha) może usunąć blok: zapytanie o receipt znowu zwraca `null`, węzły, które poszły za reorgiem, zwracają transakcję do swoich mempooli, a ona zwykle trafia ponownie do bloku z innym `blockHash`, chyba że zwycięska gałąź już użyła jej nonce. Transakcja jest rozstrzygnięta, gdy jej blok jest na wysokości [[block-tag|tagu]] `finalized` lub poniżej, a `blockHash` w receipcie wciąż zgadza się z kanonicznym blokiem na tej wysokości; `safe` to tańszy etap pośredni. Zobacz [[confirmations|potwierdzenia]].",
          "Nadawca, który nie może zgubić ani zdublować płatności, identyfikuje więc rekordy po nadawcy i nonce, a nie po hashu, bo każde przyspieszenie i anulowanie zmienia hash. Przechowuje podpisane surowe bajty, by rozgłosić je ponownie po restarcie albo po [[failover|failoverze]] do providera, którego mempool nigdy ich nie widział. [[retries|Ponowienia (retry)]] identycznych bajtów traktuje jako bezpieczne, bo odpowiadają `already known`. Transakcje wysłane przez [[private-rpc|prywatne RPC]] nigdy nie trafiają do publicznych mempooli, a UserOperations z [[erc-4337|ERC-4337]] przechodzą tę samą drogę piętro wyżej, w mempoolu bundlera, z własnym hashem i receiptem."
        ]
      }
    ],
    example: {
      title: "Co zwracają trzy wywołania na każdym etapie (n to nonce transakcji)",
      note: "Trzeba pytać jeden węzeł i czytać wiersze razem; `null` z drugiego backendu, który nie widział transakcji, wygląda dokładnie jak wiersz dropped."
    },
    pitfalls: [
      "Traktowanie hasha z `eth_sendRawTransaction` jako dowodu, że sieć ma transakcję; oznacza on tylko, że przyjął ją mempool jednego węzła.",
      "Uznanie transakcji za utraconą, bo inny backend niż ten, który ją przyjął, zwraca `null` dla jej hasha.",
      "Zakładanie, że wyrzucona transakcja jest martwa; pozostaje ważna, dopóki jej nonce nie zostanie zużyty, a zachowana gdzieś kopia wciąż może trafić do bloku.",
      "Identyfikowanie rekordu płatności hashem transakcji, który zmienia się przy każdej podwyżce opłaty albo anulowaniu.",
      "Uznawanie receiptu za ostateczny bez późniejszego ponownego sprawdzenia jego `blockHash`; reorg może go przenieść albo usunąć."
    ]
  },
  "system-contracts": {
    title: "Kontrakty systemowe",
    aliases: [
      "system contracts",
      "kontrakt systemowy",
      "system call",
      "wywołanie systemowe",
      "SYSTEM_ADDRESS",
      "beacon roots contract",
      "kontrakt beacon roots",
      "history storage contract",
      "kontrakt historii hashy bloków",
      "EIP-4788",
      "EIP-2935",
      "request predeploy"
    ],
    summary: "Kontrakt systemowy to zwykły kontrakt pod stałym [[address|adresem]], który każdy [[execution-client|klient wykonawczy]] sam wywołuje na początku albo na końcu każdego [[block|bloku]], z adresu `0xfffffffffffffffffffffffffffffffffffffffe` i poza jakąkolwiek [[transaction|transakcją]], żeby trzymać w [[state|stanie]] dane protokołu, takie jak ostatnie hashe bloków, albo kolejkować żądania związane ze stakingiem. Dlatego jego storage zmienia się w każdym bloku, choć nie dotyka go żadna transakcja.",
    sections: [
      {
        heading: "Wywołania, których nikt nie podpisuje",
        paragraphs: [
          "Kontrakty czasem potrzebują danych, których nie wytwarza żadna transakcja, takich jak ostatnie hashe bloków albo root rodzica [[beacon-block|bloku beacon]], czyli hash, względem którego da się udowodnić dowolny fakt z warstwy konsensusu, a kontrakty stakingowe potrzebują sposobu, żeby poprosić [[consensus-layer|warstwę konsensusu]] o działanie. Ethereum trzyma te mechanizmy w zwykłych kontraktach pod stałymi adresami, a każdy klient w każdym bloku wykonuje do każdego z nich wywołanie systemowe (system call): wywołanie z `SYSTEM_ADDRESS` z własnym limitem 30 000 000 [[gas|gasu]] poza limitem bloku i bez opłaty.",
          "Dziś działają cztery. Przed pierwszą transakcją klient zapisuje `parentBeaconBlockRoot` z nagłówka w kontrakcie beacon roots z EIP-4788 pod `0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02`, działającym od [[hardfork|aktualizacji]] Dencun, a [[block-hash|hash]] bloku rodzica w kontrakcie historii z EIP-2935 pod `0x0000F90827F1C53a10cb7A02335B175320002935`, działającym od Pectra. Po ostatniej transakcji wywołuje kontrakt żądań wypłat z EIP-7002 pod `0x00000961Ef480Eb55e80D19ad83579A64c007002` i kontrakt żądań konsolidacji z EIP-7251 pod `0x0000BBdDc7CE488642fb579F8B00f3a590007251`. Każdy z nich zwraca [[execution-requests|żądania]], które zwalnia ze swojej kolejki (wyjścia walidatorów, częściowe wypłaty albo scalenia walidatorów), najwyżej 16 wypłat albo 2 konsolidacje na blok.",
          "Każdy z tych kontraktów zachowuje się zależnie od wywołującego: wywołany z adresu systemowego zapisuje, a każdy inny może odczytywać kontrakty beacon roots i historii albo za opłatą zakolejkować żądanie w kontrakcie żądań. Jeśli kontraktu historii albo beacon roots nie ma, wywołanie po cichu się nie udaje, ale brak kontraktu żądań czyni blok nieprawidłowym. Wszystkie cztery wdrożono transakcjami podpisanymi z góry (pre-signed), bez chain ID, więc każdy łańcuch może je powtórzyć (replay) i dostać kontrakty pod tymi samymi adresami. Glamsterdam, następna aktualizacja sieci, działająca już na Sepolii, dodaje dwa kolejne dla builderów [[enshrined-pbs|enshrined PBS]] (EIP-8282)."
        ]
      },
      {
        heading: "Dwa bufory cykliczne",
        paragraphs: [
          "Bufor cykliczny (ring buffer) to stały zestaw slotów storage, nadpisywanych po kolei w kółko. Kontrakt historii ma ich 8191: na początku bloku N zapisuje hash bloku N-1 w slocie `(N-1) % 8191`, więc blok 26 297 843 znajduje hash swojego rodzica w slocie `0x127c`. Czytający wysyła numer bloku jako surowe 32-bajtowe calldata, bez selektora [[abi|ABI]], i dostaje hash dowolnego z poprzednich 8191 bloków, czyli z około 27 godzin. Opcode `BLOCKHASH` nadal sięga tylko 256 bloków wstecz.",
          "Kontrakt beacon roots jest indeksowany timestampem. Dla bloku z timestampem `t` zapisuje `t` w slocie `t % 8191`, a root w slocie `t % 8191 + 8191`, więc on też obejmuje około 27 godzin. Odczyt przyjmuje 32-bajtowy timestamp i kończy się revertem, jeśli nie zgadza się on z zapisanym, więc wywołujący podaje timestamp bloku, w którego nagłówku był ten root. Względem tego rootu kontrakt puli stakingowej albo [[bridge|bridge'a]] może sprawdzić [[consensus-proof|dowód konsensusu]] w formacie [[ssz|SSZ]], na przykład dowód salda walidatora."
        ]
      },
      {
        heading: "Co RPC pokazuje, a co ukrywa",
        paragraphs: [
          "Odczyt jest zwyczajny: [[eth-call|eth_call]] do któregoś z tych dwóch kontraktów albo [[eth-get-storage-at|eth_getStorageAt]] na wyliczonym slocie, w dowolnym bloku, którego stan węzeł jeszcze trzyma. Puste wejście do kontraktu żądań zwraca jego bieżącą opłatę w [[wei|wei]], w przykładzie 1 wei dla kontraktu żądań wypłat. Jedna pułapka: z `from` ustawionym na adres systemowy eth_call idzie ścieżką zapisu, a kontrakt beacon roots zwraca `0x` zamiast rootu.",
          "Wywołanie systemowe nie ma hasha, [[transaction-receipt|receiptu]] ani zmiany nonce, a pola `transactions` i `gasUsed` bloku go nie uwzględniają. `debug_traceBlockByNumber` w [[geth|Geth]], zbudowany wokół pojedynczych transakcji, wykonuje wywołania z początku bloku bez tracingu, a te z końca bloku pomija. [[indexer|Indekser]], który odtwarza storage z diffów stanu poszczególnych transakcji, widzi, że te sloty zmieniają się bez przyczyny. Listy dostępu na poziomie bloku (block-level access lists, EIP-7928) z Glamsterdam, które zapisują każde konto i każdy slot dotknięty przez blok, uwzględniają te zapisy: pod indeksem 0 przed transakcjami i n+1 po nich."
        ]
      },
      {
        heading: "Ani predeploy L2, ani precompile",
        paragraphs: [
          "[[predeploys|Predeploy]] na L2 może wyglądać tak samo: `L1Block` w OP Stack pod `0x4200000000000000000000000000000000000015`, który przechowuje dane o najnowszym bloku L1, też jest nadpisywany w każdym bloku. Zapisuje go jednak prawdziwa transakcja: depozyt typu `0x7e` pod indeksem 0, z hashem i receiptem, zwracany przez [[eth-get-block-by-number|eth_getBlockByNumber]] tak jak każda inna transakcja.",
          "[[precompiles|Precompile]] to natywny kod pod niskim adresem, bez żadnych zapisanych danych, a kontrakt systemowy to bytecode, którego sloty żyją w trie stanu, więc [[eth-get-code|eth_getCode]] zwraca jego kod, a [[eth-get-proof|eth_getProof]] dowodzi wartości jego slotów. Właśnie dlatego istnieje EIP-2935: gdy ostatnie hashe są w stanie, [[stateless-ethereum|klient stateless]] dostaje je wewnątrz [[witness|witnessa]] bloku, zamiast samemu przechowywać łańcuch."
        ]
      }
    ],
    example: {
      title: "Kontrakty systemowe w bloku 26 297 843 (0x19145f3) mainnetu",
      note: "Oba odczyty kontraktu historii zwracają `parentHash` tego bloku, a odczyt beacon roots zwraca jego `parentBeaconBlockRoot`; żaden z tych zapisów nie pojawia się wśród 106 transakcji bloku ani w jego `gasUsed`."
    },
    pitfalls: [
      "Wysyłanie wywołania zakodowanego według ABI z selektorem funkcji, przez co wejście ma więcej niż 32 bajty i kontrakt robi revert.",
      "Wyliczanie timestampu dla beacon roots z genesis i numeru slotu, co kończy się revertem dla slotu bez bloku, bo żaden blok wykonawczy nie ma takiego timestampu.",
      "Pytanie kontraktu historii o bieżący blok albo o blok sprzed ponad 8191 bloków; oba wywołania kończą się revertem."
    ]
  }
};
