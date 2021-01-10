import {
  subscribeOnStream,
  unsubscribeFromStream,
  searchSymbols
} from "./stream";
import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
  IBasicDataFeed,
  OnReadyCallback,
  ResolveCallback,
  ErrorCallback,
  SearchSymbolsCallback,
  HistoryCallback
} from "../charting_library.min";
// ...
export default {
  // ...
  onReady(callback: OnReadyCallback) {
    console.log("onReady");
    setTimeout(() => {
      callback({ supported_resolutions: ["1s", "5s", "15s"] });
    }, 0);
  },
  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    rangeStartDate,
    rangeEndDate,
    onResult: HistoryCallback,
    onError: ErrorCallback,
    isFirstCall: boolean
  ) {
    onResult([], { noData: true });
  },
  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback
  ) {
    const [fixedExchange, ticker] = userInput.includes(":")
      ? userInput.split(":")
      : [undefined, userInput];

    searchSymbols(ticker, fixedExchange, onResult);
  },
  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ) {
    console.log(`Searching for: ${symbolName}`);
    const [exchangeName, ticker] = symbolName.split(":");

    if (!ticker) return;
    const symbolInfo: LibrarySymbolInfo = {
      ticker: ticker,
      name: ticker,
      full_name: "",
      description: "",
      type: "",
      exchange: exchangeName,
      minmov: 1,
      listed_exchange: exchangeName,
      has_seconds: true,
      has_intraday: true,
      timezone: "Etc/UTC",
      data_status: "streaming",
      session: "24x7",
      pricescale: 100000000 ,
      supported_resolutions: ["1s", "5s", "15s"]
    };

    setTimeout(() => {
      onResolve(symbolInfo);
    }, 0);
  },
  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    subscribeUID: string,
    onResetCacheNeededCallback: () => void
  ) {
    console.log(
      "[subscribeBars]: Method call with subscribeUID:",
      subscribeUID
    );
    subscribeOnStream(
      symbolInfo,
      resolution,
      onTick,
      subscribeUID,
      onResetCacheNeededCallback
    );
  },

  unsubscribeBars(subscriberUID: string) {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    unsubscribeFromStream(subscriberUID);
  }
} as IBasicDataFeed;
