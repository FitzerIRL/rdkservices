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
#include <interfaces/IPackager.h>

namespace WPEFramework {
namespace Plugin {
namespace {
    constexpr auto* kInstallMethodName = _T("install");
    constexpr auto* kSynchronizeMethodName = _T("synchronize");

    constexpr auto* kDAC_InstallMethodName            = _T("install");
    constexpr auto* kDAC_RemoveMethodName             = _T("remove");
    constexpr auto* kDAC_CancelMethodName             = _T("cancel");
    constexpr auto* kDAC_IsInstalledMethodName        = _T("isInstalled");
    constexpr auto* kDAC_GetInstallProgressMethodName = _T("getInstallProgress");
    constexpr auto* kDAC_GetInstalledMethodName       = _T("getInstalled");
    constexpr auto* kDAC_GetPackageInfoMethodName     = _T("getPackageInfo");
    constexpr auto* kDAC_GetAvailableSpaceMethodName  = _T("getPackageAvailableSpace");
}

    class Packager : public PluginHost::IPlugin, public PluginHost::IWeb, public PluginHost::JSONRPC {
    public:
        struct Params : public Core::JSON::Container {
            Params& operator=(const Params& other) = delete;
            Params() {
                Add(_T("package"), &Package);
                Add(_T("architecture"), &Architecture);
                Add(_T("version"), &Version);

                Add(_T("id"), &Id);
                Add(_T("appId"), &AppId);
                Add(_T("task"), &Id);
                Add(_T("listener"), &Id);
            }
            Params(const Params& other)
                : Package(other.Package)
                , Architecture(other.Architecture)
                , Version(other.Version)
                , Id(other.Id)
                , AppId(other.AppId)
                , Task(other.Task)
                , Listener(other.Listener)
            {
                Add(_T("package"), &Package);
                Add(_T("architecture"), &Architecture);
                Add(_T("version"), &Version);

                Add(_T("id"), &Id);
                Add(_T("appId"), &AppId);
                Add(_T("task"), &Task);
                Add(_T("listener"), &Listener);
            }
            Core::JSON::String Package;
            Core::JSON::String Architecture;
            Core::JSON::String Version;

            Core::JSON::String Id;
            Core::JSON::String AppId;
            Core::JSON::String Task;
            Core::JSON::String Listener;
        };

        Packager(const Packager&) = delete;
        Packager& operator=(const Packager&) = delete;
        Packager()
            : _skipURL(0)
            , _connectionId(0)
            , _service(nullptr)
            , _implementation(nullptr)
            , _notification(this)
        {
            // Packager API
            Register<Params, void>(kInstallMethodName, [this](const Params& params) -> uint32_t
            {
                return this->_implementation->Install(params.Package.Value(), params.Version.Value(),
                                                                 params.Architecture.Value());
            });
            Register<void, void>(kSynchronizeMethodName, [this]() -> uint32_t
            {
                return this->_implementation->SynchronizeRepository();
            });

            // DAC Installer API
            Register<Params, void>(kDAC_CancelMethodName, [this](const Params& params) -> uint32_t
            {
                return this->_implementation->Cancel(params.Id.Value(), params.Task.Value(), 
                                                                params.Listener.Value());
            });
            
            Register<Params, void>(kDAC_IsInstalledMethodName, [this](const Params& params) -> uint32_t
            {
                return this->_implementation->IsInstalled(params.Id.Value(), params.AppId.Value());
            });
        }

        ~Packager() override
        {
            Unregister(kInstallMethodName);
            Unregister(kSynchronizeMethodName);

            Unregister(kDAC_InstallMethodName);
            Unregister(kDAC_RemoveMethodName);
            Unregister(kDAC_CancelMethodName);
            Unregister(kDAC_IsInstalledMethodName);
            Unregister(kDAC_GetInstallProgressMethodName);
            Unregister(kDAC_GetInstalledMethodName);
            Unregister(kDAC_GetPackageInfoMethodName);
            Unregister(kDAC_GetAvailableSpaceMethodName);
        }

        BEGIN_INTERFACE_MAP(Packager)
            INTERFACE_ENTRY(PluginHost::IPlugin)
            INTERFACE_ENTRY(PluginHost::IWeb)
            INTERFACE_ENTRY(PluginHost::IDispatcher)
            INTERFACE_AGGREGATE(Exchange::IPackager, _implementation)
        END_INTERFACE_MAP

        //   IPlugin methods
        const string Initialize(PluginHost::IShell* service) override;
        void Deinitialize(PluginHost::IShell* service) override;
        string Information() const override;

        //	IWeb methods
        void Inbound(Web::Request& request) override;
        Core::ProxyType<Web::Response> Process(const Web::Request& request) override;

    private:
        class Notification : public RPC::IRemoteConnection::INotification {
        public:
            explicit Notification(Packager* parent)
                : _parent(*parent)
            {
                ASSERT(parent != nullptr);
            }

            ~Notification() override
            {
            }

            Notification() = delete;
            Notification(const Notification&) = delete;
            Notification& operator=(const Notification&) = delete;

            void Activated(RPC::IRemoteConnection*) override
            {
            }

            void Deactivated(RPC::IRemoteConnection* connection) override
            {
                _parent.Deactivated(connection);
            }

            BEGIN_INTERFACE_MAP(Notification)
                INTERFACE_ENTRY(RPC::IRemoteConnection::INotification)
            END_INTERFACE_MAP

        private:
            Packager& _parent;
        };

        void Deactivated(RPC::IRemoteConnection* connection);

        uint8_t _skipURL;
        uint32_t _connectionId;
        PluginHost::IShell* _service;
        Exchange::IPackager* _implementation;
        Core::Sink<Notification> _notification;
    };

}  // namespace Plugin
}  // namespace WPEFramework
