---
author: Immortal
pubDatetime: 2024-12-01T15:22:00Z
modDatetime: 2024-13-01T09:12:47.400Z
title: Bug Report Misconfigured Role-Based Access for Project Registration Service in my University's ERP Portal
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
# Finding a Security Bug in My University's ERP Portal

As a student interested in cybersecurity, I recently discovered a concerning vulnerability in my university's VTOP portal that handles summer internship project registrations. Here's what I found and how I responsibly disclosed it.

## The Issue

While using the portal, I noticed that the role-based access controls weren't properly implemented. This meant I could potentially access other students' internship project details - something that should definitely be private!

## Technical Details

The vulnerability existed in this API endpoint:
```
POST /vtop/summer/ViewStudentRegistrationDetailsPage HTTP/1.1
Host: vtop.vitap.ac.in
```

This falls under OWASP's **A01:2021-Broken Access Control** category.

## How I Found It

Using Burp Suite as my proxy tool, I was able to:
1. Intercept the API requests
2. Identify the project ID parameter
3. Test different project IDs using Burp Suite's Intruder

Here's what that looked like:

![](@assets/attachment/7d883c3a4757ff2d514f46f67402089b.png)

![](@assets/attachment/911465fcd91fbd3c36e9f774d293fccb.png)


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
