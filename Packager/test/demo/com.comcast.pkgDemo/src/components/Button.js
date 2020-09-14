export default class TileButton extends lng.Component {
    static _template( )
    {
      let RR = lng.shaders.RoundedRectangle;

      var pts = 20;
      var buttonClr = 0xFF888888;  // #888888FF  // Background
      var frameClr  = 0xFF666666;  // #666666FF
      var textClr   = 0xFFffffff;  // #ffffffFF

      var stroke    = 2;
      var strokeClr = 0xCC888888;

      return {
        Button:
        {
          RRect: { w: 150, h: 40, rect: true, color: buttonClr, shader: { radius: 8, type: RR, stroke: stroke, strokeColor: strokeClr} },
          Label: { mount: 0.5, x: (w => 0.5 * w), y: (h => 0.55 * h), text:{ text: 'Ok', fontSize: pts, textColor: textClr } },
        },
        }
      };

//     _handleEnter()
//     {
// //        this.fireAncestors('$buttonClicked', this.pkgId);
//     }

    setLabel(s)
    {
      var obj = this.tag("Label");
      obj.text.text = s;
    }

    _focus()
    {
      console.log("BUTTON - _focus()")

      var bg  = this.tag("Button")

      bg.setSmooth('alpha', 1.00, {duration: 0.3});
      bg.setSmooth('scale', 1.15, {duration: 0.3});
    }

    _unfocus()
    {
      console.log("BUTTON - _unfocus()")

      var bg  = this.tag("Button")

      bg.setSmooth('alpha', 0.5, {duration: 0.3});
      bg.setSmooth('scale', 1.0, {duration: 0.3});
    }

    _init()
    {
      var button = this.tag("Button");

      // if( this.label)
      // {
      //   this.setLabel(this.label);
      // }

      button.w = this.w;
      button.h = this.h;

      button.tag("Label").text = this.label;
    }
  }//CLASS
