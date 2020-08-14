/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include "Module.h"
#include "utils.h"

#include <interfaces/IPackager.h>

#include <stdio.h>
#include <stdint.h>
#include <string>

using namespace std;

#define DDD()   fprintf(stderr, "\nHUGH >>>>> DAC Impl ... Call ... %s()", __FUNCTION__);

namespace WPEFramework {
namespace Plugin {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    // Encapsulate Package Info
    //
    class PackageInfoEx : public Exchange::IPackager::IPackageInfoEx
    {
      public:
        // PackageInfoEx() = delete;
        PackageInfoEx(const PackageInfoEx&) = delete;
        PackageInfoEx& operator=(const PackageInfoEx&) = delete;

        ~PackageInfoEx() override
        {
          Release();
        }

        PackageInfoEx(const std::string& name,
                      const std::string& version,
                      const std::string& pkgId)
                        : _name(name)
                        , _version(version)
                        , _pkgId(pkgId)
        {
          //AddRef();
        }

        PackageInfoEx() = default;

        // Ref Counting
        virtual void AddRef() //const
        {
            Core::InterlockedIncrement(_refCount);

            // LOGERR("\n PackageInfoEx <<< AddRef()  - %d", _refCount);
        }

        virtual uint32_t Release() //const
        {
            if (--_refCount == 0)
            {
              LOGERR("\n PackageInfoEx <<< Release()  - DELETE");
              delete const_cast<PackageInfoEx*>(this);
            }
            return (0);
        }

        BEGIN_INTERFACE_MAP(PackageInfoEx)
            INTERFACE_ENTRY(Exchange::IPackager::IPackageInfoEx)
        END_INTERFACE_MAP

        typedef const unsigned char uchar_t; // helper

        #define uchar2string(v)  string( reinterpret_cast<const char*>(v))

        // Getter / Setter 
        string  Name()                const override { return _name;          };
        void setName( string v )            { _name = v;                      };
        void setName( uchar_t *v )          { _name = uchar2string(v);        };

        string  BundlePath()          const override { return _bundlePath;    };
        void setBundlePath( string v )      { _bundlePath = v;                };
        void setBundlePath( uchar_t *v )    { _bundlePath = uchar2string(v);  };

        string  Version()             const override { return _version;       };
        void setVersion( string v)          { _version = v;                   };
        void setVersion( uchar_t *v )       { _version = uchar2string(v);     };

        string  PkgId()               const override { return _pkgId;         };
        void setPkgId( string v )           { _pkgId = v;                     };
        void setPkgId( uchar_t *v )         { _pkgId = uchar2string(v);       };

        string  Installed()           const override { return _installed;     };
        void setInstalled( string v)        { _installed = v;                 };
        void setInstalled( uchar_t *v )     { _installed = uchar2string(v);   };

        int64_t  SizeInBytes()        const override { return _sizeInBytes; };
        void setSizeInBytes( int64_t v)     { _sizeInBytes = v;               };

        string  Type()                const override { return _type;          };
        void setType( string v)             { _type = v;                      };
        void setType( uchar_t *v )          { _type = uchar2string(v);        };

        // Helpers
#if 0
        static JsonObject pkg2json(PackageInfoEx *pkg)
        {
            JsonObject json;

            if(pkg == nullptr)
            {
              LOGERR("ERROR:  pkg2json() - Bad args.  NULL");
              return json; // empty
            }

            char sizeInBytes[255];
            snprintf(sizeInBytes, sizeof(sizeInBytes), "%jd", pkg->SizeInBytes());

            json["name"]       = pkg->Name();
            json["bundlePath"] = pkg->BundlePath();
            json["version"]    = pkg->Version();
            json["id"]         = pkg->PkgId();
            json["installed"]  = pkg->Installed();
            json["size"]       = std::string(sizeInBytes);//pgk.SizeInBytes();
            json["type"]       = pkg->Type();

            return json;
        };

        static JsonObject pkg2json(PackageInfoEx &pkg)
        {
            JsonObject json;

            char sizeInBytes[255];
            snprintf(sizeInBytes, sizeof(sizeInBytes), "%jd", pkg.SizeInBytes());

            json["name"]       = pkg.Name();
            json["bundlePath"] = pkg.BundlePath();
            json["version"]    = pkg.Version();
            json["id"]         = pkg.PkgId();
            json["installed"]  = pkg.Installed();
            json["size"]       = std::string(sizeInBytes);//pgk.SizeInBytes();
            json["type"]       = pkg.Type();

            return json;
        };

        static PackageInfoEx *json2pkg(JsonObject& json)
        {
            PackageInfoEx *pkg = Core::Service<PackageInfoEx>::Create<PackageInfoEx>();

            pkg->setName(                   json[ "name"       ].String().c_str()  );
            pkg->setBundlePath(             json[ "bundlePath" ].String().c_str()  );
            pkg->setVersion(                json[ "version"    ].String().c_str()  );
            pkg->setPkgId(                  json[ "id"         ].String().c_str()  );
            pkg->setInstalled(              json[ "installed"  ].String().c_str()  );
            pkg->setSizeInBytes( std::stoi( json[ "size"       ].String().c_str()) );
            pkg->setType(                   json[ "type"       ].String().c_str()  );

            return pkg;
        };
#endif //0

        static void printPkg(PackageInfoEx *pkg)
        {
          if(pkg == nullptr)
          {
            return;
          }

          LOGWARN("pkgInfo >>>>>>>       name: %s",  pkg->Name()       .c_str() ); // name
          LOGWARN("pkgInfo >>>>>>>       path: %s",  pkg->BundlePath() .c_str() ); // path
          LOGWARN("pkgInfo >>>>>>>    version: %s",  pkg->Version()    .c_str() ); // version
          LOGWARN("pkgInfo >>>>>>>         id: %s",  pkg->PkgId()      .c_str() ); // id
          LOGWARN("pkgInfo >>>>>>>  installed: %s",  pkg->Installed()  .c_str() ); // installed
          LOGWARN("pkgInfo >>>>>>>       size: %jd", pkg->SizeInBytes()         ); // size
          LOGWARN("pkgInfo >>>>>>>       type: %s",  pkg->Type()       .c_str() ); // type
        }

        static void printPkg(PackageInfoEx &pkg)
        {
          printPkg(&pkg);
        }

#undef uchar2string

      private:
        string   _name;
        string   _bundlePath;
        string   _version;
        string   _pkgId;
        string   _installed;    // timestamp
        int64_t  _sizeInBytes;  // bytes
        string   _type;

        int _refCount;

    };// CLASS - PackageInfoEx
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    class PackagerExImplementation: /* public PluginHost::IPlugin,*/ public PluginHost::JSONRPC
    {
      public:

        PackagerExImplementation(const PackagerExImplementation&) = delete;
        PackagerExImplementation& operator=(const PackagerExImplementation&) = delete;

        PackagerExImplementation();
        ~PackagerExImplementation();

        // DAC Installer API
        uint32_t Install_imp(const string& pkgId, const string& type, const string& url, const string& token, const string& listener);
        uint32_t Remove_imp( const string& pkgId, const string& listener);
        uint32_t Cancel_imp( const string& task,  const string& listener);

        uint32_t IsInstalled_imp(const string& pkgId);
        uint32_t GetInstallProgress_imp(const string& task);
 
 void SendN();

        using IPackageInfoEx = Exchange::IPackager::IPackageInfoEx;

        IPackageInfoEx::IIterator* GetInstalled_imp();

        PackageInfoEx* GetPackageInfo_imp(const string& pkgId);

        int64_t GetAvailableSpace_imp();

        std::vector<PackageInfoEx *> mPPPlist;

        static const int64_t STORE_BYTES_QUOTA;
        static const char*   STORE_NAME;
        static const char*   STORE_KEY;

    private:
        uint32_t doInstall(const string& pkgId, const string& type, const string& url,const string& token, const string& listener);

        uint32_t mTaskNumber;
    };//CLASS - PackagerExImplementation

  } // namespace Plugin
}  // namespace WPEFramework