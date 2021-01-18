<template>
  <div class="chart" :id="`chart_container-${instance}`"></div>
</template>
<script lang="ts">
import { Vue, Watch, Component, Prop } from "vue-property-decorator";
import {
  widget,
  ChartingLibraryWidgetConstructor,
  IChartingLibraryWidget,
  ShapePoint,
  ThemeName,
  PricedPoint,
  Bar,
  IChartWidgetApi,
  IPositionLineAdapter
} from "@/static/charting_library/charting_library.min";
//import {penis} from "plugins/penis"
import Datafeed from "static/charting_library/api/index";
declare const TradingView: any;

@Component
export default class TradingViewComponent extends Vue {
  @Prop({ type: Number, required: true }) readonly instance!: number;
  chart: any = null;
  base: string = "XBT";
  quote: string = "USD";
  exchange: string = "BITMEX";
  bars: Array<Bar> = [];
  shape: any = {};
  start_time: number = 0;
  drawbook(){
    console.log('i niggers\n\n\n\n\n')
    
  }
  drawshit(price: number){
    try{
      var end_time = new Date().getTime()/1000

      
      if(Object.keys(this.shape).length === 0 && this.shape.constructor === Object){
        // left border
        var L = this.chart.chart(0).createMultipointShape([ {price, time: this.start_time}, {price: price-50, time:this.start_time}], {shape: "trend_line", lock: true, disableSelection: true})

        // bottom border
        var B = this.chart.chart(0).createMultipointShape([ {price: price-50, time:this.start_time}, {price: price-50, time:end_time}], {shape: "trend_line", lock: true, disableSelection: true})

        // top border
        var T = this.chart.chart(0).createMultipointShape([ {price: price, time:this.start_time},  {price: price, time:end_time}], {shape: "trend_line", lock: true, disableSelection: true})

        // right border
        var R = this.chart.chart(0).createMultipointShape([ {price, time: end_time}, {price: price-50, time:end_time}], {shape: "trend_line", lock: true, disableSelection: true})

        if(L != undefined && T != undefined &&B != undefined &&R != undefined ){
          this.shape = {left: L, right: R, top: T, bottom: B}
          
          console.log(JSON.stringify(this.shape), Object.keys(this.shape).length, this.shape.top)
        }
      }
      else{
        // bottom
        console.log(Object.keys(this.shape).length)
        var points = this.chart.chart(0).getShapeById(this.shape.bottom).getPoints();
        points[1] = {price: points[0].price, time: end_time}
        this.chart.chart(0).getShapeById(this.shape.bottom).setPoints(points);

        // top
        var points = this.chart.chart(0).getShapeById(this.shape.top).getPoints();
        points[1] = {price: points[0].price, time: end_time}
        this.chart.chart(0).getShapeById(this.shape.top).setPoints(points);

        // right side
        var points = this.chart.chart(0).getShapeById(this.shape.right).getPoints();
        points = [{price: points[0].price, time: end_time},{price: points[1].price, time: end_time}]
        this.chart.chart(0).getShapeById(this.shape.right).setPoints(points);
      }
    }
    catch(e){
      //console.error("NIGGERNIGGERNIGGERNIGGERNIGGER", e)
    }
  }
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
      debug: false,
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
    this.start_time = new Date().getTime()/1000;
    this.chart.onChartReady(() => {
      //chart.selectLineTool("trend_line");
      setInterval(() => {
        var price = 36300
        this.drawshit(price);

      }, 1000);


        
    })
    /*setTimeout(() => {     */

  }
}
</script>
<style scoped>
.chart {
  height: 100vh;
}
</style>
