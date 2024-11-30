---
author: Immortal
pubDatetime: 2024-12-01T15:22:00Z
modDatetime: 2024-13-01T09:12:47.400Z
title: Misconfigured Role-Based Access for MTech Integrated Summer Internship Project Registration Service in VTOP Portal
slug: misconfigured-role-based-access-vtop-portal
featured: true
draft: false
tags:
    - security
    - vulnerability
    - RBAC
description:
    Analysis of a misconfigured role-based access control in the VTOP portal that allowed unauthorized access to other students' summer internship project details.
---

**Summary:**

Misconfigured Role-Based Access for MTech Integrated Summer Internship Project Registration Service in VTOP Portal. I was able to view/access other students' summer internship project details, download the files, and edit them.

- API Route:
    ```
    POST /vtop/summer/ViewStudentRegistrationDetailsPage HTTP/1.1
    Host: vtop.vitap.ac.in
    ```
- OWASP Security Vulnerability: [**A01:2021-Broken Access Control**](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- Expected Severity: Medium (6.5)
- Expected Weakness: Information Disclosure
- Tools used: Chromium, Burp Suite 2024
- Suggested fix: API Rate Limiting, Implement token-based download URLs with expiration, Implement Tracing and Centralized log alerts on API

**Proof of concept:**

![](@assets/attachment/7d883c3a4757ff2d514f46f67402089b.png)

Got the API requests proxied from Burp Suite and sent them to the Intruder.

![](@assets/attachment/911465fcd91fbd3c36e9f774d293fccb.png)

![](@assets/attachment/37b59818fbab791ec7b900be75f9fb81.png)

Located the project ID and added it as an API payload variable (using my own CSRF token).

![](@assets/attachment/c91cf2840510c60f66b3a784b79f3b59.png)

Added the payload dictionary in the Burp Suite Intruder.

![](@assets/attachment/2e6b39b568e0f83e12840309ff39447f.png)

Bruteforcing for API content retrieval of project data, resulting in a misconfigured data leak.

<iframe width="700" height="400" src="https://www.youtube.com/embed/FpmfaGwH3kE?si=_iicYWxgznpTy0EX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Demo: [YouTube Video](https://www.youtube.com/embed/FpmfaGwH3kE?si=_iicYWxgznpTy0EX)

![](@assets/attachment/85b8245a0d5b93402462a655b70544a6.png)

**Misconfigured RBAC (Role-Based Access) Behavior:**

After intercepting the ViewStudentRegistrationDetailsPage sub API route, changing/replacing it with another existing project ID from the intercepted API body.

![](@assets/attachment/54e55e390fb394dfdb86b6850334835f.png)

Gained access to files and edit access to others' forms.

![](@assets/attachment/11584aa5ab950e2624d6cd9688346784.png)

![](@assets/attachment/a8ef2d4520621cdd4e98140f1dee5047.png)

**Expected Behavior:**

My registration form content, for example:

![](@assets/attachment/ece16c4258e99a0cde83d2e0998c91f8.png)
