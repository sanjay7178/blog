---
author: Sai Sanjay
pubDatetime: 2026-09-28T00:00:00Z
modDatetime: 2026-09-28T06:14:50Z
title: "Remote Desktop on Linux: Why the Compositor Now Matters"
slug: remote-desktop-linux-x11-wayland
featured: true
draft: false
tags:
  - linux
  - wayland
  - x11
  - remote-desktop
  - open-source
description: How X11 and Wayland shape remote desktop support, why compositors and desktop integration matter, and what projects like Termland do differently.
---

I started looking into this while working on [Termland](https://github.com/jboero/termland), a remote desktop project that creates headless Wayland sessions. What seemed like a question about connecting a client to a server turned into a much larger question: who actually owns the desktop that I am trying to access?

On Linux, the answer affects almost everything. Can I connect before logging in? Will the connection survive a locked screen? Can I create a separate desktop without a monitor? Why does a tool work on GNOME but behave differently on KDE, even when both use Wayland?

The transition from X11 to Wayland caused real regressions in established remote workflows. But describing the situation as “Wayland cannot do remote desktop” misses what has changed. Remote access now depends on the compositor, permission interfaces, and session infrastructure as well as the network protocol.

This article reflects documentation and project code reviewed in September 2026. It is an architectural overview, not a performance benchmark, and development announcements are identified separately from released capabilities.

## Table of contents

## What do we mean by remote desktop?

Before comparing protocols, we need to separate the workflows people expect.

| Workflow                   | What you are connecting to                                         |
| -------------------------- | ------------------------------------------------------------------ |
| Application forwarding     | A remotely running application whose windows appear locally        |
| Desktop sharing            | An existing desktop visible to both the local and remote user      |
| Remote login               | A login service that can create a graphical session                |
| Persistent virtual desktop | An independent desktop that can survive disconnects and be resumed |

A screen-sharing tool might be excellent for helping someone at their computer and still be unsuitable for a workstation that must be accessible after reboot. A virtual desktop can be useful without showing the applications already open on the physical display.

These differences are not academic. [GNOME's configuration documentation](https://github.com/GNOME/gnome-remote-desktop/blob/main/docs/configuration.md) explicitly separates remote assistance, single-user headless operation, and headless remote login. Any claim that a product “supports remote desktop” should say which workflow it supports.

## X11 made remote display part of the architecture

The X Window System uses a client-server model. The application is an X client; the X server provides the display and input services. The server can be on the computer in front of you while the application runs somewhere else. The [X11 protocol specification](https://xorg.freedesktop.org/archive/current/doc/xproto/x11protocol.pdf) defines that communication.

This is the foundation behind SSH X forwarding. The remote application connects to a proxy display, and SSH carries its X11 traffic to your local X server. It does not simply stream a video of the remote machine's entire desktop.

Other remote tools built different experiences around X. [Xpra](https://github.com/Xpra-org/xpra/blob/master/README.md), for example, provides persistent remote X11 applications that can be disconnected and reattached. [xrdp](https://github.com/neutrinolabs/xrdp) speaks RDP to the remote client while commonly providing the Linux desktop through Xorg with xorgxrdp, or through Xvnc.

So even in the X11 world, application forwarding, virtual desktops, and screen sharing were separate approaches. What they benefited from was a broadly available display-server integration point.

Input automation also had an established interface: the [XTEST extension](https://www.x.org/releases/X11R7.5/doc/man/man3/XTestFakeKeyEvent.3.html) can synthesize keyboard and pointer events. This helped tools interact with desktops without integrating separately with every window manager.

That convenience came with security considerations. X11 does have mechanisms for restricting untrusted clients, including the [SECURITY extension](https://www.x.org/releases/X11R7.7-RC1/doc/xextproto/security.pdf). It would be inaccurate to say it has no security model. The relevant question is how much authority a connected application receives over the rest of the desktop.

## Wayland changes the integration point

Under Wayland, the compositor is also the display server. It assembles application surfaces, manages their placement, determines focus, and routes input. Applications render their content and submit buffers for presentation. [Wayland's architecture documentation](https://wayland.freedesktop.org/architecture.html) describes this consolidation.

Mutter in GNOME, KWin in Plasma, and compositors built with wlroots are therefore central to remote access. A remote desktop server needs a way to obtain their output and send authorized input back into their sessions.

Wayland does not include X11-style network transparency in its core protocol. That does not prohibit remoting. The [upstream FAQ](https://wayland.freedesktop.org/faq.html) explicitly discusses additional remote rendering infrastructure.

This shift explains why old assumptions stop working. An application that knew how to capture an X display cannot assume the same approach will capture a complete native Wayland desktop.

[Xwayland](https://wayland.freedesktop.org/docs/book/Xwayland.html) preserves compatibility for X11 applications within a Wayland session. It does not turn the whole desktop back into an X server accessible to every legacy capture tool.

## Getting pixels is only one part of the problem

A functioning remote desktop needs capture, input, clipboard integration, authentication, and a defined session lifecycle. It also needs to handle monitor layouts, scaling, cursor behavior, and keyboard differences.

The shared infrastructure increasingly looks like this:

```mermaid
flowchart TD
    app[Remote desktop application]
    portal[XDG Desktop Portal + desktop backend]
    compositor[Wayland compositor]
    pipewire[PipeWire]
    input[EIS / libei]

    app -->|Request access| portal
    portal -->|Approved capture and input interfaces| compositor
    compositor -->|Screen content| pipewire
    pipewire -->|Captured frames| app
    app -->|Emulated input| input
    input -->|Input events| compositor
```

This is one important integration path, not a requirement that every server must use exactly this arrangement.

The [ScreenCast portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.ScreenCast.html) exposes selected screen content through PipeWire. The [RemoteDesktop portal](https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.RemoteDesktop.html) handles access to input devices and related capabilities. [libei](https://libinput.pages.freedesktop.org/libei/api/index.html) supplies an emulated-input interface while leaving the compositor in control of processing events.

An important consequence is that screen sharing and remote control are separate capabilities. The [xdg-desktop-portal-wlr registration](https://raw.githubusercontent.com/emersion/xdg-desktop-portal-wlr/master/wlr.portal) advertises Screenshot and ScreenCast, but not RemoteDesktop. Being able to share a screen in a browser therefore does not prove that a remote control application can inject input through the same backend.

Permission persistence is another source of confusion. Remembering a portal grant can reduce repeated approval prompts. It does not by itself create a graphical session after reboot or preserve applications after logout.

## Why remote login is harder than screen sharing

If someone is already logged in, a compositor and graphical session already exist. A remote login service must arrange for them to exist and connect the incoming user to the correct session.

[SUSE's engineering account](https://www.suse.com/c/headless-remote-sessions-in-gnome-part-2/) describes GNOME's approach: a system daemon receives the connection, GDM creates a headless login session, and a session daemon takes over the connection. After authentication, the user session has another compositor and requires another handover. [The follow-up](https://www.suse.com/c/headless-remote-sessions-in-gnome-part-3/) explains that transition.

This is why adding a video encoder is not enough. The implementation must coordinate the display manager, credentials, session ownership, and connection transitions. RDP's server-redirection mechanism is useful here because the connection needs to move between components.

Unattended access and multi-user access also deserve separate labels. Connecting without local approval does not necessarily mean a service can provide independent desktops to several users concurrently.

## Why the experience differs across distributions

It is tempting to ask why every distribution needs its own remote desktop application. Often, the actual difference starts with the desktop environment.

[GNOME Remote Desktop](https://github.com/GNOME/gnome-remote-desktop/blob/main/README.md) integrates with Mutter. KDE provides [KRDP](https://github.com/KDE/krdp), with remote desktop configuration introduced in [Plasma 6.1](https://kde.org/announcements/plasma/6/6.1.0/). These are upstream desktop projects, rather than separate protocols invented by each distribution.

Distributions then ship particular versions, dependencies, services, and defaults. My reading of the evidence is that these combinations explain much of what users perceive as distribution-specific behavior. Both [RHEL 10](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/administering_rhel_by_using_the_gnome_desktop_environment/remotely-accessing-the-desktop) and [SLES 16](https://documentation.suse.com/sles/16.0/html/SLES-gnome-remote-desktop/index.html) document GNOME-based remote access.

Raspberry Pi Connect is a useful example of a product built around existing pieces. Its [launch announcement](https://www.raspberrypi.com/news/raspberry-pi-connect/) describes connecting a browser client to a VNC server using WebRTC. It adds the discovery and connection experience users need.

Its [documentation](https://www.raspberrypi.com/documentation/services/connect.html) also makes the integration boundary explicit: screen sharing requires an existing graphical session and a desktop supported by its WayVNC integration. Switching to KDE/KWin changes compatibility, even on the same device and distribution.

## The network protocol still matters

The compositor problem does not make protocol choice irrelevant. It means protocol choice is only one layer of the decision.

| Protocol or approach | What it provides                           | What to check separately                                |
| -------------------- | ------------------------------------------ | ------------------------------------------------------- |
| X11 forwarding       | Remote application display                 | Application compatibility and behavior over the network |
| RFB/VNC              | Framebuffer updates and input              | Supported encodings, authentication, and extensions     |
| RDP                  | Display, input, and extensible channels    | Implemented graphics, redirection, and client features  |
| Waypipe              | Wayland application forwarding             | Application and buffer compatibility                    |
| Termland             | Its own media, input, and session protocol | Client support and compositor/session integration       |

[RFB](https://www.rfc-editor.org/info/rfc6143/) is the protocol behind VNC. [RDP](https://learn.microsoft.com/en-us/windows/win32/termserv/remote-desktop-protocol) includes multiple channels and capabilities, but the label alone does not guarantee that every server implements every feature.

Also, native Wayland application forwarding exists. [waypipe](https://manpages.debian.org/bookworm/waypipe/waypipe.1.en.html) proxies Wayland applications and offers an SSH-oriented workflow resembling X forwarding. Losing built-in network transparency did not eliminate this use case; it moved the work into another component.

## The browser is a client, not the whole remote desktop stack

So far, I have mostly discussed the server side. But many people do not want to install a desktop client at all. They want to open a URL, log in, and get their applications. Browser-based access is an important part of the remote desktop landscape, and it comes in several different forms.

The distinction I find useful is between putting a browser interface in front of an existing protocol, designing desktop streaming around the browser, and managing the environment being streamed. These approaches can overlap, but they solve different problems. None makes the server's display architecture irrelevant.

### Browser clients and gateways

[noVNC](https://novnc.com/info.html) is a JavaScript VNC client that uses WebSockets and Canvas. The browser handles RFB, while a WebSocket-to-TCP proxy such as websockify commonly connects it to a conventional VNC server. If the server already offers WebSocket connections, a separate proxy is not necessarily needed. This is browser delivery of VNC, not a replacement for the server that supplies the desktop.

That gives noVNC a useful integration boundary. The same browser client can sit in front of different VNC backends. Whether the desktop is an X11 virtual session, a compatible Wayland compositor exposed through a VNC server, or a virtual machine's console is a separate question. Installing noVNC alone does not create that session or grant access to its screen and input.

[Apache Guacamole](https://guacamole.apache.org/doc/gug/guacamole-architecture.html) takes a gateway approach. Its browser client communicates using the Guacamole protocol; the web application forwards that traffic to `guacd`, whose protocol plugins connect to RDP, VNC, or SSH endpoints. The browser does not need a separate implementation of each backend protocol. SSH access here is a terminal, not automatically a graphical desktop.

```mermaid
flowchart LR
    browser["One browser interface<br/>Separate RDP, VNC and SSH sessions"]
    webapp["Guacamole web application<br/>Authentication and connection tunnels"]
    gateway["guacd gateway<br/>Load a client plugin for each connection"]
    rdp["RDP client plugin<br/>Session A"]
    vnc["VNC client plugin<br/>Session B"]
    ssh["SSH client plugin<br/>Session C"]
    rdphost["RDP server<br/>Remote desktop"]
    vnchost["VNC server<br/>Remote desktop"]
    sshhost["SSH server<br/>Remote shell"]

    browser <-->|Guacamole protocol over WebSocket or HTTP tunnel| webapp
    webapp <-->|Separate Guacamole protocol connections over TCP| gateway
    gateway <--> rdp
    gateway <--> vnc
    gateway <--> ssh
    rdp <-->|RDP| rdphost
    vnc <-->|VNC / RFB| vnchost
    ssh <-->|SSH| sshhost
```

The common browser protocol is what makes this work: each plugin translates its backend's output and input into Guacamole's display and event instructions. Connections run independently, so different protocols can be used concurrently without the browser implementing them. The gateway does not merge those sessions or create the desktops behind them; each endpoint still owns its remote environment.

Guacamole's “clientless” description means no dedicated client installation on the user's device, not no server infrastructure. It still needs the gateway and reachable endpoints. For a Linux desktop, the RDP or VNC server behind it remains responsible for capture, input, and sessions. A gateway can unify access without making different display servers equivalent.

[Xpra's HTML5 client](https://github.com/Xpra-org/xpra-html5/blob/master/README.md) is another route: browser access to an Xpra server. This extends the persistent-application model discussed earlier. It is worth remembering that browser remoting need not mean streaming an entire workstation; applications can be the unit of access. The browser interface does not change which applications and display environments the server can host.

### Browser-native desktops

[KasmVNC](https://github.com/kasmtech/KasmVNC) couples a Linux desktop/application server with a browser client. Despite the name, the project explicitly departs from standard RFB and does not support traditional VNC viewers. That is a compatibility tradeoff: designing for the browser can mean moving away from an established client ecosystem. It should not be presented as just another interchangeable noVNC backend.

KasmVNC and Kasm Workspaces are also different layers. Workspaces adds a platform around access to desktops and applications, including containerized environments. Its [fixed-infrastructure documentation](https://www.kasmweb.com/docs/latest/how_to/fixed_infrastructure.html) also covers existing RDP, VNC, SSH, and KasmVNC endpoints. For those external machines, presenting a workspace does not mean Workspaces manages the underlying server's lifecycle. Streaming technology and workspace orchestration should be evaluated separately.

LinuxServer.io's [Webtop 2.0 announcement from July 2023](https://www.linuxserver.io/blog/webtop-2-0-the-year-of-the-linux-desktop) illustrates this evolution. Earlier Webtop combined xrdp, Guacamole, and an in-house client. Webtop 2.0 moved to KasmVNC to deliver containerized Linux desktops through a browser. That article is useful architectural history, but it is not a description of today's backend: [current Webtop documentation](https://docs.linuxserver.io/images/docker-webtop/) describes its Selkies-based platform.

[Selkies](https://github.com/selkies-project/selkies) provides Linux desktop streaming with GPU/CPU acceleration and a browser client, for deployment on hosts or in containers and clustered environments. Its current upstream README describes plain WebSockets as the default transport, with WebRTC available as an option. Calling it “WebRTC remote desktop” without a version or qualification would miss that current design.

At a high level, the streaming path looks like this. Selkies' [current component documentation](https://docs.selkies.io/latest/) identifies `pixelflux` as the screen-capture and encoding component and `pcmflux` as the audio component. The diagram abstracts away codec negotiation and deployment-specific display/input backends; it is not a claim that every Wayland compositor exposes the same interfaces.

```mermaid
flowchart TD
    session["Linux applications and desktop session<br/>X11 or a supported Wayland environment"]
    video["pixelflux<br/>Screen capture and GPU / CPU encoding"]
    audio["pcmflux<br/>Session audio processing"]
    server["Selkies server"]
    transport["WebSockets by default<br/>WebRTC optional"]
    browser["HTML5 browser client<br/>Decode / render video and play audio"]
    input["Session-specific input integration"]

    session -->|Screen frames| video
    session -->|Audio| audio
    video -->|Encoded video| server
    audio -->|Audio stream| server
    server -->|Video and audio| transport
    transport -->|Media delivery| browser
    browser -->|Keyboard, mouse and gamepad events| transport
    transport -->|Input messages| server
    server --> input
    input -->|Apply input to remote session| session
```

[SealSkin](https://github.com/selkies-project/sealskin) uses Selkies to stream applications from isolated server-side containers. Its browser extension opens links and files remotely, while the platform manages sessions and storage. Selkies handles streaming; SealSkin manages the workloads. The remote environment still needs a working display and input stack.

What interests me here is ownership of the environment. A packaged container desktop can provide the display server, applications, and streaming components together. That is different from attaching to the GNOME session already running on somebody's laptop. Supporting X11 and Wayland paths in such a stack does not prove compatibility with every installed compositor. Transport, encoding, and the supported session environment still need separate checks.

### Remote access and administration

[Chrome Remote Desktop](https://support.google.com/chrome/a/answer/2799701?hl=en) combines a browser-facing service with software on the remote host. Google's enterprise documentation describes organizational controls over its use. The [network guide](https://support.google.com/chrome/a/answer/16364503?hl=en) explains that connection negotiation involves Google services. This is a different operational model from running your own noVNC endpoint or Guacamole gateway; enterprise policies do not turn it into a separate display protocol.

[MeshCentral](https://docs.meshcentral.com/) puts browser desktop access alongside terminals and file management in a remote-management platform. Its documentation covers the host agent and browser-to-agent relay architecture. That makes it relevant when the goal is administering machines, not just giving users a fresh desktop. As with other agent-based tools, browser access says nothing by itself about which Linux graphical sessions the installed agent can control.

[RustDesk Web Client V2](https://rustdesk.com/blog/rustdesk-web-client-v2-preview/) deserves its own mention because it brings RustDesk access into the browser. The project's announcement and web entry point describe it as a **preview**. I would not assume feature parity with the native clients or treat their Linux support as a guarantee for the web client. There are two compatibility questions: can this browser deployment establish the RustDesk connection, and can the remote host capture and control the intended session? RustDesk's separately announced unattended Wayland work, discussed below, should not be conflated with the web client's status.

### Managed Linux sessions

[ThinLinc](https://www.cendio.com/thinlinc/what-is-thinlinc/) belongs in this discussion as a server-side Linux desktop and application platform, rather than merely another browser viewer. Its [Web Access documentation](https://www.cendio.com/resources/docs/tag/tlwebaccess_usage.html) describes logging into the server through a browser, starting a session or reusing an existing one. This directly addresses the session-management layer that a standalone frontend leaves to other components.

The same documentation notes a useful limitation: Web Access does not fully support choosing between multiple sessions belonging to the same user. It also documents a clipboard dialog rather than transparent local clipboard integration. These are concrete workflow details worth checking instead of assuming that a web client duplicates the native experience. Managed remote sessions should not be mistaken for automatic access to an arbitrary local Wayland desktop.

For broader enterprise context, [Amazon DCV](https://aws.amazon.com/hpc/dcv/) provides Linux and Windows remote environments with browser and native clients. [Azure Virtual Desktop](https://learn.microsoft.com/en-us/azure/virtual-desktop/connect-azure-virtual-desktop) offers browser access to its published resources, while [Citrix Workspace for HTML5](https://docs.citrix.com/en-us/citrix-workspace-app-for-html5) delivers hosted applications and desktops through the browser. These illustrate the distinction between client delivery and the infrastructure that provisions and owns sessions.

<details>
<summary>Research notes: compare browser clients, gateways, and session platforms</summary>

Here is how I would separate the roles, rather than rank the products:

| Project               | Architectural role                               | Server/session dependency                              | X11/Wayland relevance                                      |
| --------------------- | ------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------- |
| noVNC                 | Browser RFB client                               | VNC server, often a WebSocket proxy                    | Determined by the VNC backend                              |
| Guacamole             | Multi-protocol gateway                           | `guacd` and RDP/VNC/SSH endpoints                      | Determined by the graphical endpoint                       |
| Xpra HTML5            | Browser application/session client               | Xpra server and its hosted applications                | Browser access retains server-side display requirements    |
| KasmVNC               | Browser-oriented streaming server/client         | KasmVNC-hosted environment                             | Not a universal compositor adapter                         |
| Kasm Workspaces       | Workspace and access platform                    | Containers or existing endpoints                       | Depends on the chosen workspace/backend                    |
| Webtop                | Packaged container desktop                       | Desktop image and current Selkies stack                | Image and desktop configuration matter                     |
| Selkies               | Browser-native streaming stack                   | Supported capture/input and display environment        | Offers X11/Wayland paths, not universal session access     |
| Chrome Remote Desktop | Service-mediated remote access                   | Host software and Google services                      | Host/session support must be checked                       |
| MeshCentral           | Agent-based administration                       | Management server and remote agents                    | Depends on the agent's graphical integration               |
| RustDesk Web          | Browser remote-access client, documented preview | RustDesk host and compatible connection infrastructure | Web-client status and host Wayland support are separate    |
| ThinLinc Web Access   | Browser entry to managed Linux sessions          | ThinLinc server and session services                   | Managed sessions are distinct from sharing a local desktop |

</details>

The browser removes one installation step for the user. It does not remove the need to authenticate them, produce pixels, accept authorized input, or decide who owns the session. That brings us back to compositors—and to projects that create the remote environment themselves.

## What Termland does differently

Termland approaches the problem by creating a compositor environment for remote sessions. Its [labwc backend](https://github.com/jboero/termland/blob/main/crates/termland-compositor/src/backend/labwc.rs) hosts desktop-mode sessions, while its [cage backend](https://github.com/jboero/termland/blob/main/crates/termland-compositor/src/backend/cage.rs) hosts a single application.

Rather than depending on access to an arbitrary existing desktop, the server launches the environment it expects. It captures frames through screencopy and injects input through virtual keyboard and pointer protocols. Its [wire protocol](https://github.com/jboero/termland/blob/main/docs/protocol.md) carries media, input, clipboard data, and session control.

The [session implementation](https://github.com/jboero/termland/blob/main/crates/termland-compositor/src/session.rs) separates a client attachment from the detached compositor process. That is the foundation for a desktop that survives a client disconnect.

This choice also exposes a limitation worth discussing. Termland's [window-enumeration code](https://github.com/jboero/termland/blob/main/crates/termland-compositor/src/toplevels.rs) documents that Plasma's task manager expects a KWin-specific interface unavailable in labwc. Running Plasma components inside another compositor does not reproduce every part of a normal Plasma session.

Termland is therefore a useful case study in controlling the server environment, rather than evidence that compositor differences have disappeared. It owns more of the session stack and must account for the desktop integration that comes with that responsibility.

## Progress is real, but version numbers matter

The situation is not frozen. [WayVNC](https://github.com/any1/wayvnc) supports compatible wlroots-based sessions, including headless ones. [Weston](https://wayland.pages.freedesktop.org/weston/toc/running-weston.html) provides an RDP backend. GNOME has remote login infrastructure.

KDE's [August 2026 development report](https://planet.kde.org/david-edmundson-2026-08-25-whats-happening-in-kde-remote-desktop-improved-unattended-mode-and-more/) describes work toward Plasma 6.8 on unattended operation, input, clipboard behavior, and compatibility. It also identifies concurrent multi-user headless service as unfinished. These are development milestones, not guarantees about every distribution's installed packages.

RustDesk likewise announced an [unattended Wayland preview](https://rustdesk.com/blog/unattended-remote-access-wayland/) for x86_64 Debian/Ubuntu systems in August 2026. The preview qualification matters when comparing available products.

Performance needs similar care. A codec's compression efficiency or a transport's features do not establish end-to-end responsiveness. Capture, encoding, queues, network loss, decoding, and presentation all contribute. A still desktop's bandwidth says little about typing latency or scrolling quality.

## What I want from Linux remote desktop

I want compatibility claims to describe actual workflows: an existing desktop, a new session, access after reboot, disconnect and resume, and multiple users. I also want them to identify the tested compositor and version.

The architecture already offers several ways forward: integrate with the desktop compositor, use shared portal infrastructure, or create a dedicated remote compositor. Each has useful capabilities and practical costs.

Working through Termland made the missing piece clearer to me. Linux needs more reusable infrastructure around session creation and ownership, alongside capture and input standards. Users should be able to choose a remote desktop tool with a clear understanding of what it can access and how long that session will live.

Wayland remoting is possible and improving. Making it predictable across desktops is the work still in front of us.
