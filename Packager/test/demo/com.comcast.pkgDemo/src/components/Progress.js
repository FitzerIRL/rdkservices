export default class Progress extends lng.Component {
    static _template( )
    {
      let RR = lng.shaders.RoundedRectangle;

      var  pts = 20;
      var  barClr1  = 0xFFcccccc;  // #ccccccFF  // Background
      var  frameClr = 0xFF666666;  // #666666FF
      var  textClr  = 0xFFffffff;  // #ffffffFF

    return {
        ProgressBar: {
          Background: { x: -2, y: 0, w: 4, h: 12, rtt: true, rect: true, color: frameClr, shader: { radius: 3, type: RR} },
          Progress:   { x:  0, y: 2, w: 0, h:  8, rtt: true, rect: true, color: barClr1,  shader: { radius: 3, type: RR} },
        }
      }
    };

    getProgress()
    {
      return this.value;
    }

    setProgress(pc)
    {
      this.value = pc;
      //console.log(" setProgress: " + pc)

      var ww = (this.w -4) * pc;

      this.tag("Progress").setSmooth('w', ww, {duration: 1});
    }

    _init()
    {
      this.tag("Background").w = this.w;
      this.tag("Progress").w   = 0;

      this.value = 0.0;
    }
  }//CLASS
