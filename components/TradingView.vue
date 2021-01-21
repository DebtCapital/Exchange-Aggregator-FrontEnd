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
import Datafeed from "static/charting_library/api/index";
declare const TradingView: any;

// Da bus
import { EventBus } from '../static/globalbus.js';
@Component
export default class TradingViewComponent extends Vue {
  @Prop({ type: Number, required: true }) readonly instance!: number;
  chart: any = null;
  base: string = "BTC";
  quote: string = "USDT";
  exchange: string = "BINANCE";
  bars: Array<Bar> = [];

  /// key: price, value: object containing rectangle lines: right,left,top,bottom
  shapes: Record<number,any> = []
  shape: any = {};
  start_time: number = 0;

  /// Deletes one shape
  clearShape(price: number){
    this.chart.activeChart().removeEntity(this.shapes[price].left)
    this.chart.activeChart().removeEntity(this.shapes[price].right)
    this.chart.activeChart().removeEntity(this.shapes[price].top)
    this.chart.activeChart().removeEntity(this.shapes[price].bottom)
    delete this.shapes[price]
  }
  /// Delete all rectangles/shapes
  clearShapes(){

    // We cannot use
    //    removeAllShapes(): void;
    // because this will also remove the user-supplied drawings
    // which would be fucking gay

    Object.keys(this.shapes).forEach((element: any) =>{
      console.log("clearshapes: ", this.shapes[element])
      this.clearShape(element); 
    })
  }

  /// Create a rectandle at a specified price with a specified width/precision
  createShape(price: number, precision: number){
    // We assume the precision is global

    // Exit if this shape exists
    if(this.shapes[price]){
      return;
    }
    try{

      // This aids ass piece of shit errors out if the grid isnt loaded, so i need to try catch it
      var end_time = new Date().getTime()/1000
      var L = this.chart.activeChart().createMultipointShape([ {price, time: this.start_time}, {price: price-precision, time:this.start_time}], {shape: "trend_line", lock: true, disableSelection: true})

      // Bottom border
      var B = this.chart.activeChart().createMultipointShape([ {price: price-precision, time:this.start_time}, {price: price-precision, time:end_time}], {shape: "trend_line", lock: true, disableSelection: true})

      // Top border
      var T = this.chart.activeChart().createMultipointShape([ {price: price, time:this.start_time},  {price: price, time:end_time}], {shape: "trend_line", lock: true, disableSelection: true})

      // Right border
      var R = this.chart.activeChart().createMultipointShape([ {price, time: end_time}, {price: price-precision, time:end_time}], {shape: "trend_line", lock: true, disableSelection: true})

      // This will be undefined if the chart has not loaded the grid yet or the drawing has failed ;(
      if(L != undefined && T != undefined &&B != undefined &&R != undefined ){
        var shape = {left: L, right: R, top: T, bottom: B}

        this.shapes[price] = shape;
        
      }   
    }
    catch(e){
      console.log("createShape error drawing this, prob not loaded yet")
    }
  }
  // Moves the right side of the box up to the newest candle body.
  redraw(price: number){
    var end_time = new Date().getTime()/1000
    try{
      // Check if we didnt get deleted before drawing
      if(this.shapes[price]){
          // bottom
          var points = this.chart.chart(0).getShapeById(this.shapes[price].bottom).getPoints();
          points[1] = {price: points[0].price, time: end_time}
          this.chart.chart(0).getShapeById(this.shapes[price].bottom).setPoints(points);

          // top
          var points = this.chart.chart(0).getShapeById(this.shapes[price].top).getPoints();
          points[1] = {price: points[0].price, time: end_time}
          this.chart.chart(0).getShapeById(this.shapes[price].top).setPoints(points);

          // right side
          var points = this.chart.chart(0).getShapeById(this.shapes[price].right).getPoints();
          points = [{price: points[0].price, time: end_time},{price: points[1].price, time: end_time}]
          this.chart.chart(0).getShapeById(this.shapes[price].right).setPoints(points);
      }
    }
    catch(e){
      console.log("redraw error, prob not loaded")
    }
  }

  redrawAll(){
    Object.keys(this.shapes).forEach((element: any)=>{
      this.redraw(element);
    })
  }
  drawityounigger(bookside: any){
    bookside.forEach((element: any) => {
      var price = element.startPrice;
      var size = element.size;
      var endprice = element.endPrice;

      // for now i will assume that endprice != 0, but it is when the book isn't aggregated lol
      //precision is the difference between 
      // TODO on server side
      this.createShape(price, Math.abs(endprice - price))

    });
  }

  bookDrawer(book: any){
    if(book['buy']){
      this.drawityounigger(book['buy'])
    }
    if(book['sell']){
      this.drawityounigger(book['sell'])
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
    EventBus.$on('bar', (bar: any) => {
      var price = 36300
      this.redrawAll()
    });
    EventBus.$on('book', (book: any) => {
      this.bookDrawer(book);
    });
  }
}
</script>
<style scoped>
.chart {
  height: 100vh;
}
</style>
