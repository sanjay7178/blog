---
author: Sai Sanjay
pubDatetime: 2026-05-30T21:38:14.644Z
modDatetime: 2026-06-05T12:00:00.000Z
title: "My LFX Mentorship Journey with CNCF kube-burner — Term 1 '26"
slug: lfx-experience-cncf-kube-burner
featured: true
draft: false
tags:
  - lfx
  - mentee
  - kube-burner
  - cncf
  - kubernetes
  - performance-testing
  - keda
description: How I went from a Kubernetes beginner running bare-metal clusters to contributing a full KEDA performance-testing feature to kube-burner as an LFX mentee.
---

![](@assets/images/kube-burner-lfx.png)

<!-- Three months of late nights, Go generics, and pprof rabbit holes as an **LFX Mentorship Term 1 '26** mentee with [kube-burner](https://github.com/kube-burner/kube-burner) (CNCF). Here's how I got there and what I built. -->

This LFX Mentorship 2026 Term 1 with [kube-burner](https://github.com/kube-burner/kube-burner) (CNCF) was a great experience for me. I was fortunate enough to work on Enhancements around Kubernetes performance testing .

---

## Background

During my Master's degree, I stumbled upon Docker and quickly fell in love with how a single container could run anywhere. That curiosity naturally led me to Kubernetes. My college senior was running full SIEM stacks on bare-metal clusters QEMU + KVM, Vagrant, kubeadm, Proxmox, Ansible — and watching him work made k8s feel less intimidating and more like an adventure.

My thesis took it further. I built a Kubernetes-Based Secure Browser Isolation Platform on a bare-metal RKE2 cluster. I got to know about [kcli](https://github.com/karmab/kcli) , it helped me provision production-grade Kubernetes clusters from scratch. With the cluster up, I used `client-go`, Istio, MetalLB, and Guacd for scalable RDP, then validated performance with Playwright stress tests, measuring HPA/VPA scaling events, etcd/kube-apiserver resource usage, and P99 WebSocket RTT.

[_Some of the performance benchmarks from my thesis_](@assets/images/master-thesis-performance-benchmarks.png)

![one does not simply learn kubernetes](https://i.imgflip.com/1bij.jpg)
_One does not simply "just use Kubernetes" — ask me how I know_

---

## What is kube-burner?

**kube-burner** is a Kubernetes performance and scale testing framework widely used in the CNCF ecosystem (e.g., by Red Hat for OpenShift). Using a YAML config, it creates objects at scale, measures latencies, collects Prometheus metrics, and indexes the results. It's often the tool behind large-scale cluster performance benchmarks.

---

## How I Found the Project (Before LFX)

My path to kube-burner started _before_ the LFX program. While working on my thesis, my ad hoc Python performance scripts weren't cutting it, I needed structured, reproducible results. That search led me to kube-burner.

I cloned the repo, read the code, and started contributing in November 2025. Three PRs merged before applications even opened:

_[PR #1045](https://github.com/kube-burner/kube-burner/pull/1045)_: pprof DaemonSet for Node-Level Profiling : Added automated `DaemonSet`-based profiling for node-level processes (`kubelet`, `cri-o`) with node affinity, RBAC setup, and readiness checks. Tested on a k0s + CRI-O cluster via kcli. The maintainers ([@rsevilla87](https://github.com/rsevilla87), [@sferlin](https://github.com/sferlin)) were direct, technically sharp, and genuinely engaged , that first interaction set the tone for everything after.

_[PR #1047](https://github.com/kube-burner/kube-burner/pull/1047)_: `--set` Flag for Config Overrides : Helm-inspired CLI flag to override any YAML config value (`--set jobs.0.jobIterations=100`), eliminating the need for separate config files per test variation.

_[PR #1052](https://github.com/kube-burner/kube-burner/pull/1052)_: Multi-YAML Document Support : Enabled multi-document YAML (`---` separated) in object templates , essential for deploying grouped resources like Istio `Gateway` + `VirtualService`.

Having three merged PRs before the application period, I believe, played a big role in getting selected.

![success kid pr merged](https://i.imgflip.com/1bhf.jpg)
_That feeling when your first few PRs get merged_

---

## Getting Selected for LFX Mentorship

The [Linux Foundation Mentorship (LFX) Program](https://mentorship.lfx.linuxfoundation.org/) is a structured, paid 3-month mentorship where you work on open-source projects under the guidance of experienced maintainers.
My application for **kube-burner Term 1 '26 (March–May)** was straightforward: I pointed to my existing contributions, described the some of the issues like usng --dry-run to cli flag a gap I had identified, and wrote a proposal.

The moment I got the acceptance email was surreal.

![lfx acceptance](@assets/images/lfx-acceptance.jpeg)

---

## The Mentorship: What I worked on

_[PR #1068](https://github.com/kube-burner/kube-burner/pull/1068) Job Hooks_: Shell command hooks that run at specific points in a kube-burner job (`beforeDeployment`, `afterDeployment`, etc.). The `background: true` mode runs hooks in a goroutine alongside the main workload built with goroutines, wait groups, channels, and mutexes for proper lifecycle handling.

_[PR #1119](https://github.com/kube-burner/kube-burner/pull/1119) Templated Kinds_: Moved GVK (Group-Version-Kind) resolution from startup to render time, so templates with dynamic kind names like `TestResource{{.Iteration}}` work correctly unlocking CRD-based workloads.

_[PR #1180](https://github.com/kube-burner/kube-burner/pull/1180) `--dry-run` Validation_: Validates your entire workload config (template syntax, GVK availability, RBAC permissions) without creating a single resource. Modeled after ClusterLoader2's approach with graceful degradation when no cluster is available.

_[PR #1198](https://github.com/kube-burner/kube-burner/pull/1198) Measurements Format Migration_: The most challenging refactor. Unified all latency measurement types (pods, PVCs, VMIs, nodes, etc.) into a consistent JSON schema using Go generics (`GenericLatencyDocFactory[T any, L ConditionSetter]`), making downstream analysis significantly easier across all 10 measurement types.

_[PR #1246](https://github.com/kube-burner/kube-burner/pull/1246) UUID Bug Fix in TSDB Indexer_: Fixed the output directory being literally named `collected-metrics-{{.UUID}}` instead of substituting the actual UUID. One-line fix, real impact.

---

## The Big One: KEDA Performance Testing

This is what the mentorship was ultimately building toward. [KEDA](https://keda.sh/) (Kubernetes Event-driven Autoscaling) is a CNCF graduated project that lets you scale workloads based on external events like message queues or metrics. But despite being widely adopted, nobody had a reliable way to performance-test it at scale.** A GitHub issue requesting automated load testing ([KEDA #4411](https://github.com/kedacore/keda/issues/4411)) had been open since **March 2023\*\*, and users were reporting serious slowdowns scaling delays stretching to hours ([#6063](https://github.com/kedacore/keda/issues/6063)) and API throttling under moderate load ([#3810](https://github.com/kedacore/keda/issues/3810)) — with no tool to reproduce the problems consistently.

<!--![this is fine keda](https://i.imgflip.com/wxica.jpg)
_KEDA users trying to run 1,250 ScaledObjects in 2023. The 2.5-hour scale event is fine. This is fine._-->

<!-- ### The Research (Issue #1158)

In **February 2026**, I opened [kube-burner issue #1158](https://github.com/kube-burner/kube-burner/issues/1158) to propose adding KEDA support. I spent weeks researching:

- KEDA's existing [keda-performance](https://github.com/kedacore/keda-performance) tooling (Grafana k6-based, limited)
- How `customStatusPaths` in kube-burner could partially cover the use case — but couldn't split **phase latency** (ScaledObjectCreated → HPACreated vs HPACreated → DeploymentReady)
- Why a dedicated `scaledObjectLatency` measurement plugin, analogous to `podLatency`, was the right abstraction

My research comment on the issue lays out exactly which Prometheus signals matter (`keda_scaler_metrics_latency`, `workqueue_queue_duration_seconds`) and why the phase-split is critical for diagnosing the specific 0→1 vs 1→2 scaling cliff. -->

### The Implementation

[PR #1234](https://github.com/kube-burner/kube-burner/pull/1234) is the core deliverable. It adds a measurement plugin that times each step of KEDA's scaling process so you can pinpoint exactly where slowdowns happen, a ready-to-use test workload that spins up message queues, triggers autoscaling, collects performance data, and cleans up — all in one run — and performance profiling support for capturing CPU and memory snapshots from KEDA's internals. Along the way, I also fixed a bug ([issue #1235](https://github.com/kube-burner/kube-burner/issues/1235)) where kube-burner would hang if a profiling target wasn't reachable.

In **May 2026**, I opened [KEDA issue #7746](https://github.com/kedacore/keda/issues/7746) to propose using this as KEDA's official CI performance check — run the benchmark on every release and catch regressions automatically. The maintainers were receptive and tagged it for discussion, which is exactly the kind of early feedback that helps upstream contributions land smoothly. A big shout-out to [@vishnuchalla](https://github.com/vishnuchalla), who helped me refine the proposal to KEDA maintainers, cleared my doubts on using kube-burner, and pointed me to the right docs when I was stuck.

---

## Lessons Learned

This experience taught me valuable lessons about open-source collaboration. I found that getting involved early and doing thorough research helped set a solid foundation. Along the way, I realized that filing clear bug reports is just as important as writing code, and that tackling unfamiliar concepts like Go generics, Goroutines, Context, Performance profiling, Prometheus metrics collection and Kubernetes internals can be highly rewarding. Most importantly, I learned that open source is an ongoing conversation; simply asking "does this make sense?" before coding often led to the best outcomes and helped me learn from the maintainers.

<!--![drake bugs are features](https://i.imgflip.com/30b1gx.jpg)
_Finding a reproducible bug — that's content_-->

---

## What's Next

I would still contribute to kube-burner and help the community in any way I can. I'm looking forward to contributing more to other CNCF projects I'm passionate about.

If you're interested in Kubernetes performance testing, come say hi in the [kube-burner Slack channel](https://cloud-native.slack.com/archives/C04PQTHFG16) (`#kube-burner` on CNCF Slack).

---

## Final Thoughts

Three months ago, I had a vague idea that Kubernetes needed a performance testing tool for _applications running on it_ : [ClusterLoader2](https://github.com/kubernetes/perf-tests/blob/master/clusterloader2/README.md) already exists for testing Kubernetes itself, but nothing filled the gap for workload-level benchmarking. Today, there's a concrete implementation, an upstream proposal, and a community conversation that didn't exist before.

LFX gave me the time, the mentorship, and the accountability to take a good idea all the way to production.

<!-- If you're considering applying — do it. Start contributing to a project you genuinely care about _now_, even before applications open. The best mentees aren't the ones with the best resumes; they're the ones who are already useful. -->

---

_You can find all my contributions at:_

- _Issues: [github.com/kube-burner/kube-burner/issues?q=author:sanjay7178](https://github.com/kube-burner/kube-burner/issues?q=is%3Aissue+author%3Asanjay7178)_
- _PRs: [github.com/kube-burner/kube-burner/pulls?q=author:sanjay7178](https://github.com/kube-burner/kube-burner/pulls?q=is%3Apr+author%3Asanjay7178)_
- _KEDA proposal: [github.com/kedacore/keda/issues/7746](https://github.com/kedacore/keda/issues/7746)_
