---
author: Sai Sanjay
pubDatetime: 2025-08-28T13:56:10Z
modDatetime: 2025-08-28T13:56:10Z
title: Google Summer of Code'25 Final Report
slug: gsoc-25-final-report
featured: true
draft: false
tags:
  - gsoc
  - hashicorp-vault
  - docker
  - podman
  - docker-swarm
  - k8s
description: Add Docker swarm support to sugar cli and develop secrets management docker plugin
---

## Table of contents

### Project Title

Add Docker swarm support to sugar cli
### Project Description 

This project will enable Sugar users to manage Docker Swarm clusters directly through Sugar’s command-line interface (CLI). These enhancements will streamline container orchestration workflows and make Sugar a more versatile tool for developers transitioning from development to production environments. New commands will enable users to perform tasks such as initializing, joining, creating, scaling, updating, and inspecting Swarm services with simplified Docker Swarm Node and Secrets Management
### Project Information

- Organisation : Open Science Labs
- Mentors : Ivan Ogasawara , Ana Krelling , Devansh Parmar
- Repositories : [sugar](https://github.com/sugar-org/sugar) , [swarm-external-secrets](https://github.com/sugar-org/swarm-external-secrets)
- URL : https://summerofcode.withgoogle.com/programs/2025/organizations/open-science-labs 
- Docs :  
	- https://sugar-org.github.io/sugar/
	- https://sugar-org.github.io/swarm-external-secrets
### Summary 

In this project we aimed to integrate the current sugar workflow integrate with docker swarm , this can make drastic improvements to developer workflow . Added unit test and smoke test for docker swarm integration. 

This is the presentation had show cased sugar-cli at [FOSS United Hyderabad](https://fossunited.org/c/hyderabad/2025-apr) Meetup April 2025
- [Google Slides](https://docs.google.com/presentation/d/1JJBFckFq8SiTeP-JOWrPQhoUGYROhEWPrAigiw71LS8/edit?usp=sharing)
- [Event Link](https://fossunited.org/c/hyderabad/2025-apr/cfp/3cvk203l1o)

### Additional Contributions 

During the contribution period I've seen a lack of makim  (another OSL project) to package and distribute among various package managers of prior operating systems. So I decided to use [fpm](https://github.com/jordansissel/fpm) and Integrated with Github Actions CI to build cross platform packaging formats .

Also during the sugar-cli integration with docker swarm, I've seen a lack of external secret providers (like hashicorp vault, Azure Key Vault , OpenBao, Google Secrets Manager) to integrate and operate with docker swarm containers , but there's a existing solution present with  kubernetes using [external-secrets](https://github.com/external-secrets/external-secrets) and with my mentors guidance I've worked on developing a docker daemon native plugin named  [swarm-external-secrets](https://sugar-org.github.io/swarm-external-secrets) . This plugin ensures to run along with docker swarm containers in a stack synchronizing the docker secrets with external secret providers on each secret update/rotation .
### Merged Code

- [Contributions to sugar cli ](https://github.com/sugar-org/sugar/pulls?q=is%3Apr+is%3Aclosed+author%3Asanjay7178+)
- [Contributions to swarm-external-secrets](https://github.com/sugar-org/swarm-external-secrets/pulls?q=is%3Apr+is%3Aclosed+author%3Asanjay7178+)
- [Contributions to makim ](https://github.com/makim-org/makim/pulls?q=is%3Apr+is%3Aclosed+author%3Asanjay7178)
### Future Work

Looking ahead , I am committed to continuing my contributions to sugar cli , by adding tui support and fix any existing bugs in the future. My involvement with the OSL community has been incredibly fulfilling, and I plan to extend my contributions to other OSL repositories as well. By staying engaged with the development process, I hope to further enhance the functionality and reliability of these tools, ensuring they remain robust and useful for the entire community.
## Acknowledgement

I would like to express my gratitude to Google, the OSL organization for their support and guidance throughout this journey. I am particularly grateful to my project mentor Ivan Ogasawara, whose invaluable advice and expertise were instrumental in the success of this project. This experience has been immensely rewarding, and I would love to have the opportunity to work with the OSL team again in the future