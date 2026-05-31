---
author: Sai Sanjay
pubDatetime: 2026-05-30T21:38:14.644Z
modDatetime: 2026-05-30T21:38:14.644Z
title: Looking back at the LFX Mentorship Program Term 1 '26 - My journey to Becoming a kube-burner contributor
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
description: Add Docker swarm support to sugar cli and develop secrets management docker plugin
---

![](@assets/images/kube-burner-lfx.png)


### Background

When I was doing my 3rd year of masters in engineering , I tried just and felt docker can run complex software application's on any machine independent of it's CPU architecture.

After the vast way running containerized applications in docker , I see kubernetes (k8s) seems to be quite interesting to learn from it's container orchestration and scheduling perspective. Although I was a begineer in terms of learning k8s , but at the same time one of my college senior was shown what he as running SIEM based applications via k8s on various environment's like QEMU+KVM with vagrant script with kubeadm setup on a laptop , simple minikube and bare metal debian 12 (Minimal Bookworm) VM's provisioned on proxmox hypervisome with some autiomation using Ansible scripts for kubeadm setup. My senior was kind enough to show naive k8s installation on bare metal VM's using kubeadm and we worked a lil bit azure AKS using microsoft azure startup credits from another senior to host [CTF Challenge platform server](https://github.com/ctfd/ctfd) using [CTFd Helm Chart](https://artifacthub.io/packages/helm/ctfd/ctfd) and Istio, the deployment wasn't perfect but worked to serve more than 20 teams .

Cut down to 2025 , My master's research thesis to work on open source A Kubernetes-Based Secure Browser Isolation Platform with Integrated Safe File Viewer and Phishing Mitigation , So I leveraged **client-go** within a Go API server to automate ephemeral pod lifecycle management, utilized **Istio** for service mesh and **MetalLB** for robust load-balancer based deployments, and ensured scalable RDP via a **Guacd protocol** integration, with the entire **RKE2 bare metal** cluster provisioned using the **kcli CLI**, subsequently validating performance against multi-user **Playwright** stress tests (using Python scripts) by charting **HPA/VPA** scaling events, **etcd** / **kube-api-server** CPU/Memory usage, and **P99 websocket RTT** to confirm scalability (benchmarks at [https://github.com/browsersec/benchmark](https://www.google.com/url?source=gmail&sa=E&q=https://github.com/browsersec/benchmark)).

![master-thesis-performance-benchmarks](@assets/images/master-thesis-performance-benchmarks.png)





