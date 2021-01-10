<template>
  <div class="chart" :id="`chart_container-${instance}`"></div>
</template>
<script lang="ts">
import axios from "axios";
import { Vue, Watch, Component, Prop } from "vue-property-decorator";
import {
  widget,
  ChartingLibraryWidgetConstructor,
  IChartingLibraryWidget,
  ShapePoint,
  ThemeName,
  PricedPoint,
  Bar
} from "@/static/charting_library/charting_library.min";
import Datafeed from "static/charting_library/api/index";
declare const TradingView: any;

@Component
export default class TradingViewComponent extends Vue {
  @Prop({ type: Number, required: true }) readonly instance!: number;
  chart: any = null;
  base: string = "BTC";
  quote: string = "USDT";
  exchange: string = "BINANCE";
  bars: Array<Bar> = [];

  mounted() {
    const chart: IChartingLibraryWidget = new widget({
      fullscreen: false,
      autosize: true,

      symbol: `${this.exchange}:${this.base}${this.quote}`,
      container_id: `chart_container-${this.instance}`,
      library_path: "/charting_library/",
      datafeed: Datafeed,
      locale: "en",
      timezone: "Etc/UTC",
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user_id",
      debug: true,
      interval: "1",
      timeframe: "1",
      theme: "Dark",
      time_frames: [
        {
          text: "1s",
          resolution: "1s"
        },
        { text: "15s", resolution: "15s" }
      ]
    });
    this.chart = chart;
  }
}
</script>
<style scoped>
.chart {
  height: 100vh;
}
</style>
