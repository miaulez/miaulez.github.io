---
layout: single
title: 0day - Try Hack Me
excerpt: "0day invloves exploiting a shellshock vulnerability for an initial foothold, then escalating to root via a kernel exploit."
date: 2021-05-22
classes: wide
header:
  teaser: /assets/images/thm/0day/thumbnail.png
  teaser_home_page: true
  icon: /assets/images/thm-logo.png
categories:
  - tryhackme
  - infosec
tags:  
  - shellshock
  - kernel exploit
  - tryhackme
  - security
  - pentesting
  - CVE-2014-6271
---


![](/assets/images/thm/0day/1.png)

Hello, and welcome to the write-up for 0day machine on TryHackMe, a medium-rated machine that involved exploiting a shellshock vulnerability, then escalating to root via a kernel exploit.

# Nmap

```bash
# Nmap 7.91 scan initiated Mon Sep 13 06:24:27 2021 as: nmap -sC -sV -oN nmap/0day 10.10.115.124
Nmap scan report for 10.10.115.124
Host is up (0.027s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 57:20:82:3c:62:aa:8f:42:23:c0:b8:93:99:6f:49:9c (DSA)
|   2048 4c:40:db:32:64:0d:11:0c:ef:4f:b8:5b:73:9b:c7:6b (RSA)
|   256 f7:6f:78:d5:83:52:a6:4d:da:21:3c:55:47:b7:2d:6d (ECDSA)
|_  256 a5:b4:f0:84:b6:a7:8d:eb:0a:9d:3e:74:37:33:65:16 (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: 0day
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Sep 13 06:24:42 2021 -- 1 IP address (1 host up) scanned in 15.35 seconds
```

Nothing that stands up, just that the openssh is a bit outdated, but it does not have any public exploits available to aid us into gaining access to the machine

# WebServer

![](/assets/images/thm/0day/2.png)

Nothing, let’s check the source code

![](/assets/images/thm/0day/3.png)

Nothing as well, let’s dive into directory busting.

![](/assets/images/thm/0day/4.png)

Gobuster quickly found some interesting directories to have look into, let’s check each one of these

going to /uploads we discover a blank page (but we might gobuster it)

![](/assets/images/thm/0day/5.png)

let’s try /admin

![](/assets/images/thm/0day/6.png)

And again, a blank page.

peeking at /backup

![](/assets/images/thm/0day/7.png)

This looks like a private id_rsa key, it is encrypted though, let’s try cracking it

![](/assets/images/thm/0day/8.png)

The password is “letmein” , let’s try the username of 0day (as we saw on the front page)

![](/assets/images/thm/0day/9.png)

Unfortunately, it didn’t work. Let’s take a step back and revisit the last directory gobuster had found, which is /secret

![](/assets/images/thm/0day/10.png)

And.. nothing, just a photo of a turtle

But wait, there’s one more, and that is /cgi-bin, now, let me explain what /cgi-bin directory is. The cgi-bin is a folder for scripts found in the directories of the file manager. If we googled something like “cgi-bin vulnerabilities”, we’ll most likely stumble across a well-known vulnerability called “shellshock”

![](/assets/images/thm/0day/11.png)

Now, what is shellshock? Shellshock is effectively a Remote Command Execution vulnerability in bash. The vulnerability relies in the fact that bash incorrectly executes trailing commands when it imports a function definition stored into an environment variable (source: https://owasp.org/www-pdf-archive/Shellshock_-_Tudor_Enache.pdf)

# Understanding the vulnerability

![](/assets/images/thm/0day/12.png)

Googling “shellshock exploit”, quickly gives us a github page, that explains what shellshock is, and also provides an exploit for it.

![](/assets/images/thm/0day/13.png)

![](/assets/images/thm/0day/14.png)

However, having done our enumeration thoroughly and having nikto run in the background while checking the directories and all that stuff, nikto will actually tell us that there is a shellshock vulnerability on the website, let’s take a look

![](/assets/images/thm/0day/15.png)

```bash
curl -H "user-agent: () { :; }; echo; echo; /bin/bash -c 'cat /etc/passwd'" \                                                                                                                  1 ⨯
http://10.10.115.124/cgi-bin/test.cgi
```

We’ll use this payload

![](/assets/images/thm/0day/16.png)

And there we go, let’s get a shell on the box.

![](/assets/images/thm/0day/17.png)

Great, let’s stabilize the shell

![](/assets/images/thm/0day/18.png)

Let’s get the user.txt flag

![](/assets/images/thm/0day/19.png)

Quickly after running linpeas we can see that the kernel in use might be our PE vector

![](/assets/images/thm/0day/20.png)

Let’s google that up

![](/assets/images/thm/0day/21.png)

Viewing the post from exploit-db

![](/assets/images/thm/0day/22.png)

Let’s copy and compile this exploit onto the target machine

However, when we try to compile the exploit, an error shows up

![](/assets/images/thm/0day/23.png)

Let’s search for cc1 using find to see if cc1 is present on the system (maybe it isn’t in our path but it could be on the box)

# Rooted

![](/assets/images/thm/0day/24.png)

Well, simple as that we rooted this box. It was definitely not a tough machine, and you can learn that even tools like nikto can get you where you want to be. Hope you enjoyed reading this write-up.
