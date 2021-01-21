import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SearchSymbolResultItem,
  SubscribeBarsCallback
} from "../charting_library.min";
import { EventBus } from '../../globalbus.js';
const socket: WebSocket = new WebSocket("ws://localhost:4000");

const _subs: Array<Sub> = [];
type Sub = {
  channelString: string;
  listenerGuid: string;
  symbolInfo: LibrarySymbolInfo;
  resolution: ResolutionString;
  listener: Function;
  lastBar?: Bar;
};
let onSearchResult: Function;
function emit(paylod: any) {
  socket.send(JSON.stringify(paylod));
}
function subscribe(symbolInfo: LibrarySymbolInfo, timeframe: number) {
  if (symbolInfo.ticker) {
    emit({
      command: "SUBSCRIBE",
      channel: "OHLCV",
      data: {
        exchange: symbolInfo.exchange,
        ticker: symbolInfo.ticker,
        timeframe
      }
    });
    emit({
      command: "SUBSCRIBE",
      channel: "BOOKS",
      data: {
        exchange: symbolInfo.exchange,
        pair: symbolInfo.ticker,
        precision: 100
      }
    });
  }
}
export function searchSymbols(
  ticker: string,
  exchange: string | undefined,
  onResult: Function
) {
  emit({
    command: "QUERY",
    channel: "TICKERS",
    data: { exchange, ticker }
  });
  onSearchResult = onResult;
}
export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onTick: SubscribeBarsCallback,
  listenerGuid: string,
  onResetCacheNeededCallback: () => void
) {
  const channelString: string = createChannelString(symbolInfo);

  if (symbolInfo.ticker) {
    const res: number = Number(resolution.replace("S", ""));
    //console.log(resolution, res);
    subscribe(symbolInfo, res);
  }
  const newSub: Sub = {
    channelString,
    listenerGuid,
    resolution,
    symbolInfo,
    listener: onTick,
    lastBar: undefined
  };
  _subs.push(newSub);
}
export function unsubscribeFromStream(listenerGuid: string) {
  var subIndex = _subs.findIndex(e => e.listenerGuid === listenerGuid);
  if (subIndex === -1) {
    return;
  }
  const symbolInfo = _subs[subIndex].symbolInfo;
  emit({
    command: "UNSUBSCRIBE",
    channel: "OHLCV",
    data: { pair: symbolInfo.ticker, exchange: symbolInfo.exchange }
  });
  _subs.splice(subIndex, 1);
}

function onOHLCV(data: any, sub: Sub) {
  //console.log(data);
  if (data.Open === null) return;
  const bar: Bar = {
    time: data.Timestamp,
    open: data.Open,
    high: data.High,
    low: data.Low,
    close: data.Close,
    volume: data.Volume
  };
  if (sub.lastBar && data.ts < sub.lastBar.time / 1000) return;
  EventBus.$emit('bar', bar);
  //console.log(bar);
  sub.listener(bar);
  sub.lastBar = bar;
}
socket.onmessage = message => {
  const { data, source, channel } = JSON.parse(message.data);
  //console.log(channel, source, data);
  switch (channel) {
    case "BOOKS":
      EventBus.$emit('book', data);
      break;
    case "OHLCV":
      const sub = _subs.find(e => e.channelString === source.toUpperCase());
      //console.log(sub, _subs);
      if (!sub) break;
      onOHLCV(data, sub);
      break;
    case "TICKERS":
      const result = data
        .map((result: any) =>
          result.tickers.map((ticker: any) => {
            return {
              symbol: ticker,
              full_name: ticker,
              description: `${result.exchangeName}:${ticker}`,
              exchange: result.exchangeName,
              ticker: `${result.exchangeName}:${ticker}`,
              type: "Crypto"
            } as SearchSymbolResultItem;
          })
        )
        .flat();
      onSearchResult(result);
      break;
    default:
      break;
  }
};

function createChannelString(symbolInfo: LibrarySymbolInfo) {
  return `${symbolInfo.exchange}:${symbolInfo.ticker}`;
}
