import Progress from "./Progress";

export default class TileButton extends lng.Component {
    static _template( )
    {
      let RR = lng.shaders.RoundedRectangle;

      var pts = 20;
      var barClr1  = 0xFF888888;  // #888888FF  // Background
      var frameClr = 0xFF666666;  // #666666FF
      var textClr  = 0xFFffffff;  // #ffffffFF

      var stroke    = 2;
      var strokeClr = 0xFF444444;

      return {
        Button:
          {
            RRect:
            {
              w: 190, h: 120, rtt: true, rect: true, alpha: 0.8, color: frameClr, shader: { radius: 20, type: RR, stroke: stroke, strokeColor: strokeClr},

              Image: {
                mountX: 0.5,
                mountY: 0.5,
                x: (w => 0.45 * w),
                y: (h => 0.4 * h)
              },
              Label:
              { mountX: 0.5, mountY: 1.0, x: (w => 0.5 * w), y: (h => h - 5),
                text: {  text: "Label 1", fontFace: 'Regular', fontSize: pts, textColor: textClr,

                shadow: true,
                shadowColor: 0xFF000000,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                shadowBlur: 8,
                },
              },
              Icon: {
                alpha: 1.0,
                mountX: 1.0,
                scale: 0.52,
                x: (w => w + 4),
                y: (h => 0)
              },
            },

            Progress: { type: Progress, mountX: 0.0, x: 0, y: 140, w: 150, h: 8, alpha: 0.0 },
          }//Button
        }
      };

    _handleEnter() {
        this.fireAncestors('$buttonClicked', this.pkgId);

        var progress = this.tag("Progress")
        progress.setSmooth('alpha', 1, {duration: .1});
    }

    setLabel(s)
    {
      var btn = this.tag("Button");
      var obj = btn.tag("Label")

      obj.tag("Text").text = s;
    }

    setIcon(s)
    {
      var btn = this.tag("Button");
      var icn = btn.tag("Icon")

      icn.patch( {src: s } );
    }

    _focus()
    {
      var btn = this.tag("Button");
      var bg  = btn.tag("RRect")

      bg.setSmooth('alpha', 1.00, {duration: 0.3});
      bg.setSmooth('scale', 1.15, {duration: 0.3});
    }

    _unfocus()
    {
      var btn = this.tag("Button");
      var bg  = btn.tag("RRect")

      bg.setSmooth('alpha', 0.5, {duration: 0.3});
      bg.setSmooth('scale', 1.0, {duration: 0.3});
    }

    _init()
    {
      var button = this.tag("Button");

      button.w = this.w;
      button.h = this.h;

      button.tag("Label").text = this.label;

      var img = this.tag("Image");
      img.patch( {src: this.img } );
    }
  }//CLASS
