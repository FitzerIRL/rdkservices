import { Lightning, Utils } from 'wpe-lightning-sdk'
import ThunderJS from 'ThunderJS'

import { Inventory } from "./Inventory.js";

import beautify from 'json-beautify'

import TileButton from "./components/TileButton";

import OkCancel from "./components/OkCancel";

const thunder_cfg = {
  host: '127.0.0.1',
  port: 9999,
  debug: false, // VERY USEFUL
  versions: {
    default: 1, // use version 5 if plugin not specified
    Controller: 1,
    Packager: 1,
    // etc ..
  }
}

console.log('HUGH >>> Creating ThunderJS ...')

const thunderJS = ThunderJS(thunder_cfg);

export default class App extends Lightning.Component
{
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {

    let RR = Lightning.shaders.RoundedRectangle;
    let IMG = Utils.asset('images/logo.png');

    //console.log("IMG >>>>>  " + IMG)
    var ui = {
      Background: {
        w: 1920,
        h: 1080,
        color: 0xff8888aa,
        src: Utils.asset('images/background1.png'),
      },

      Title: {
        mountX: 0.5,
        mountY: 0,
        x: 1920/2,
        y: 20,
        text: {
          text: "-  Demo PKG Store  -",
          fontFace: 'Regular',
          fontSize: 70,
          textColor: 0xFFffffff,

          shadow: true,
          shadowColor: 0xff000000,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 8,
        },
      },

      PackagesList:
      {
        mountX: 0.5, x: 1920/2, y: 150, w: 1150, /*h: 225,*/ flex: {direction: 'row', padding: 45, wrap: true}, rect: true, rtt: true, shader: { radius: 20, type: RR}, color: 0x4F888888,

        // Available PACKAGES from Inventory ... injected here

      },


      HelpTip1:
      {
        mountX: 0.0, x: 1980 * 0.25, y: 120, //397,
        text: {
          text: "Use  (A)ll or (I)nfo for package metadata",
          textAlign: 'right',
          fontFace: 'Regular',
          fontSize: 16,
          textColor: 0xFFffffff,

          shadow: true,
          shadowColor: 0xff000000,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 8,
        },
      },

      HelpTip2:
      {
        mountX: 1.0, x: 1980 * 0.72, y: 120, //397,
        text: {
          text: "Use  UP/DN  arrow keys for Console",
          textAlign: 'right',
          fontFace: 'Regular',
          fontSize: 16,
          textColor: 0xFFffffff,

          shadow: true,
          shadowColor: 0xff000000,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 8,
        },
      },

      SpaceLeft:
      {
        x: 1240, y: 160,
        text: {
          text: "Space Remaining: 0 Kb",
          textAlign: 'right',
          fontFace: 'Regular',
          fontSize: 18,
          textColor: 0xaa00FF00,

          shadow: true,
          shadowColor: 0xFF000000,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 8,
        },

      },

      ConsoleBG:
      {
        mountX: 0.5, //mountY: 1.0,
        x: 1920/2, y: 150, w: 1240,
        h: 600, rect: true,
        alpha: 0.0, shader: { radius: 20, type: RR },
        color: 0xcc222222, // #222222ee
        // colorTop: 0xFF636EFB, colorBottom: 0xFF1C27bC,

        Console: {

          x: 10, y: 10,
          w: 1160,
          //h: 500,
          text: {
            fontFace: 'Regular',
            fontSize: 18,
            textColor: 0xFFffffff,
          },
        },
      }, // ConsoleBG

      // InfoButton: {
      //   w: 60,
      //   h: 60,

      //   src: Utils.asset('images/info.png'),
      // },

      OkCancel: { type: OkCancel, x: 1920/2, y: 400, w: 600, h: 180, alpha: 0.0 },
    };

    Inventory.map( (o, i) =>
    {
      ui.PackagesList[ 'Package' + i] = { pkgId: o.pkgId, type: TileButton, flexItem: {margin: 40}, w: 150, h: 80, label: o.pkgId, img: Utils.asset('images/crate2_80x80.png') }
    } );

    return ui;
  }

  setConsole(str)
  {
    this.tag('Console').text.text = str;
  }

  $okcClickedOk(pkg_id)
  {
    console.log("okcClickedOk ENTER - ... info: " + pkg_id)

    this._setState('PackagesState');

    let info = Inventory[this.buttonIndex];

    this.removePkg(info.pkgId);
  }

  $okcClickedCancel(pkg_id)
  {
    console.log("okcClickedCancel ENTER - ... info: " + pkg_id)

    this._setState('PackagesState');
  }

  $buttonClicked(pkg_id)
  {
    var info = Inventory[this.buttonIndex];
    console.log("installPkg ENTER - ... info: " + info)

    this.installPkg(pkg_id, info);
  }

  async getAvailableSpace()
  {
    var result = await thunderJS.call('Packager', 'getAvailableSpace', null);

    //this.setConsole( beautify(result, null, 2, 100) )

    this.tag('SpaceLeft').text.text = ("Space Remaining: " + result.availableSpaceInKB + " Kb");
  }

  async getPackageInfo(pkg_id)
  {
    console.log('HUGH >>> Sending Request A ...')

    let info  = { "pkgId": pkg_id };

    var result = await thunderJS.call('Packager', 'getPackageInfo', info);

    // console.log('Called >>  RESULT: ' + JSON.stringify(result));

    // this.tag('Console').text.text = beautify(result, null, 2, 100);
    this.setConsole( beautify(result, null, 2, 100) )
  }

  async getInstalled()
  {
    var result = await thunderJS.call('Packager', 'getInstalled', null);

    // this.tag('Console').text.text = beautify(result, null, 2, 100);
    this.setConsole( beautify(result, null, 2, 100) )

    this.getAvailableSpace();

    if(this.tag('PackagesList').children.length > 0)
    {
      this.tag('PackagesList').children.map(b =>
      {
        result.applications.map( installed_pkg =>
        {
          if(installed_pkg.id == b.pkgId)
          {
            b.setIcon(Utils.asset('images/check_mark.png'))
          }
        })
      });
    }//ENDIF
  }

  async isInstalled(pkd_id)
  {
    console.log('HUGH >>> Sending Request IS INSTALLED ? ...' + pkg_id)
    var result = await thunderJS.call('Packager', 'isInstalled', pkd_id);

    this.setConsole( beautify(result, null, 2, 100) )
  }


  async handleEvent(name, event, cb = null)
  {
    console.log('Listen for >> ['+name+'] -> '+event+' ...');

    if(cb != null)
    {
      // console.log('Listen for ['+name+'] using CALLBACK ...');
      return await thunderJS.on(name, event, cb);
    }
    else
    {
      return await thunderJS.on(name, event, (notification) =>
      {
          var str = " " + event + " ...  Event" + JSON.stringify(notification);
          console.log('Handler GOT >> ' + str)
      })
    }
  }

  async installPkg(pkg_id, info)
  {
    var result = await thunderJS.call('Packager', 'install', info);

    // console.log('Called >>  RESULT: ' + JSON.stringify(result));

    // this.tag('Console').text.text = beautify(result, null, 2, 100);
    this.setConsole( beautify(result, null, 2, 100) )

    var info = Inventory[this.buttonIndex];

    let buttons  = this.tag('PackagesList').children
    let button   = buttons[this.buttonIndex];
    let progress = button.tag('Progress')

    progress.setProgress(0); // reset

    let handleFailure = (notification, str) =>
    {
      let pid = pkg_id;

      console.log("FAILURE >> '"+str+"' ... notification = " + JSON.stringify(notification) )

//      var taskId = notification.task;
      var  pkgId = notification.pkgId;

      if(pkgId == pid)
      {
        button.setIcon(Utils.asset('images/x_mark.png'))

        progress.setSmooth('alpha', 0, {duration: 1.3});

        setTimeout( () =>
        {
          button.setIcon(Utils.asset('images/x_mark.png'))

          progress.setProgress(0); //reset

          this.getAvailableSpace()

        }, 1.2 * 1000); //ms

        this.setConsole( beautify(notification, null, 2, 100) )
      }
    }

    let handleFailureDownload     = (notification) => { handleFailure(notification,'FailureDownload')     };
    let handleFailureDecryption   = (notification) => { handleFailure(notification,'FailureDecryption')   };
    let handleFailureExtraction   = (notification) => { handleFailure(notification,'FailureExtraction')   };
    let handleFailureVerification = (notification) => { handleFailure(notification,'FailureVerification') };
    let handleFailureInstall      = (notification) => { handleFailure(notification,'FailureInstall')      };

    let handleProgress = (notification) =>
    {
      let pid = pkg_id;

      console.log("HANDLER >>  notification = " + JSON.stringify(notification) )

//      var taskId = notification.task;
      var  pkgId = notification.pkgId;

      if(pkgId == pid)
      {
        let pc = notification.status / 8.0;
        // console.log("New pc = " + pc);

        progress.setProgress(pc);

        if(pc == 1.0)
        {
          progress.setSmooth('alpha', 0, {duration: 2.3});

          setTimeout( () =>
          {
            button.setIcon(Utils.asset('images/check_mark.png'))

            progress.setProgress(0); //reset

            this.getAvailableSpace()

          }, 2.2 * 1000); //ms
        }
      }
    }

    let hh1 = await this.handleEvent('Packager', 'onDownloadCommence', handleProgress);
    let hh2 = await this.handleEvent('Packager', 'onDownloadComplete', handleProgress);

    let hh3 = await this.handleEvent('Packager', 'onExtractCommence',  handleProgress);
    let hh4 = await this.handleEvent('Packager', 'onExtractComplete',  handleProgress);

    let hh5 = await this.handleEvent('Packager', 'onInstallCommence',  handleProgress);
    let hh6 = await this.handleEvent('Packager', 'onInstallComplete',  handleProgress);


    let hh7 = await this.handleEvent('Packager', 'onDownload_FAILED',     handleFailureDownload);
    let hh8 = await this.handleEvent('Packager', 'onDecryption_FAILED',   handleFailureDecryption);
    let hh9 = await this.handleEvent('Packager', 'onExtraction_FAILED',   handleFailureExtraction);
    let hhA = await this.handleEvent('Packager', 'onVerification_FAILED', handleFailureVerification);
    let hhB = await this.handleEvent('Packager', 'onInstall_FAILED',      handleFailureInstall);
  }

  async removePkg(pkg_id)
  {
    console.log("removePkg ENTER - ... pkg_id: " + pkg_id)

    var params = {
      "pkgId": pkg_id
    }

    var result = await thunderJS.call('Packager', 'remove', params);

    console.log('Called >> Remove() ... RESULT: ' + JSON.stringify(result));
    this.setConsole( beautify(result, null, 2, 100) )

    let buttons  = this.tag('PackagesList').children
    let button   = buttons[this.buttonIndex];

    button.setIcon(Utils.asset('images/download3.png'))

    this.getAvailableSpace()
  }

  _init()
  {
    this.tag('Background')
      .animation({
        duration: 1,
        repeat: -1,
        actions: [
          {
            t: '',
            p: 'color',
            v: { 0: { v: 0xfffbb03b }, 0.5: { v: 0xfff46730 }, 0.8: { v: 0xfffbb03b } },
          },
        ],
      })
     // .start()

      this.buttonIndex = 0

      // Set FOCUS to 1st package
      //
      if(this.tag('PackagesList').children.length >0)
      {
        this.tag('PackagesList').children[0].setFocus = true;
      }

      this.tag('PackagesList').children.map(b =>
      {
        b.setIcon(Utils.asset('images/download3.png'))
      });

      this.getInstalled()

      this._setState('PackagesState')
  }

  static _states(){
    return [

          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          class PackagesState extends this
          {
            $enter()
            {
              console.log("HANDLE PackagesState    this.buttonIndex : " + this.buttonIndex )

              var dlg = this.tag("OkCancel");
              dlg.setSmooth('alpha', 0, {duration: 0.3});
            }

            _handleUp()
            {
              this.tag("ConsoleBG").setSmooth('alpha', 0, {duration: 0.3});
            }

            _handleDown()
            {
              this.tag("ConsoleBG").setSmooth('alpha', 1, {duration: 0.3});
            }

            _handleLeft()
            {
              if(--this.buttonIndex < 0) this.buttonIndex = 0;
            }

            _handleRight()
            {
              if(++this.buttonIndex > Inventory.length) this.buttonIndex = Inventory.length;
            }

            _handleBack()
            {
              this._setState('OKCStateEnter')
            }

            handleGetInfoALL()
            {
              console.log("GOT handleGetInfoALL() - ENTER")
              this.getInstalled();
            }

            handleGetInfo()
            {
              console.log("GOT handleGetInfo() - ENTER")

              var info = Inventory[this.buttonIndex];

              this.getPackageInfo(info.pkgId);
            }

            _handleKey(k)
            {
              switch( k.keyCode )
              {
                case 65: this.handleGetInfoALL(); break;  // 'A' key
                case 73: this.handleGetInfo();    break;  // 'I' key
                default:
                  console.log("GOT key code: " + k.keyCode)
                    break;
              }

              return true;
            }

            _handleEnter()
            {
              progress.setSmooth('alpha', 1, {duration: .1});

              this.fireAncestors('$buttonClicked', this.pkgId);
            }

            _getFocused()
            {
             //console.log("HANDLE _getFocused >>  OBJ: " + this.tag('PackagesList').children)

              return this.tag('PackagesList').children[this.buttonIndex]
            }

        }, //CLASS
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        class OKCStateEnter extends this
        {
          $enter()
          {
            console.log("HANDLE OKC " )

            var pkgId = this.tag('PackagesList').children[this.buttonIndex].pkgId;

            var dlg = this.tag("OkCancel");

            dlg.setLabel("Remove '" + pkgId + "' app ?");
            dlg.setSmooth('alpha', 1, {duration: 0.3});
           // dlg.setFocus = true;

            dlg._setState('OKCState')
          }

          _getFocused()
          {
            var dlg = this.tag("OkCancel");

            return dlg;
          }
        }
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      ]
  }//_states
}
