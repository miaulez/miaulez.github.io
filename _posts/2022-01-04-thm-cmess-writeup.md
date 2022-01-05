---
layout: single
title: CMesS - Try Hack Me
excerpt: "Can you root this Gila CMS box?"
date: 2022-01-04
classes: wide
header:
  teaser: /assets/images/thm/cmess/thumbnail.png
  teaser_home_page: true
  icon: /assets/images/thm-logo.png
categories:
  - tryhackme
  - infosec
tags:
  - tar  
  - gila cms
  - enumeration
  - lfi
  - security
  - pentesting
  - CVE-2020-5513
---

![](/assets/images/thm/cmess/1.png)

Heyo, today we’re doing Cmess from tryhackme, a medium-rated box that involved finding a local file inclusion, looking at a configuration file to find a subdomain, getting a password for a user that we can log into an admin panel with. For remote code execution we’re abusing an upload form and we modify a .htaccess file. On the box there’s a backup password hidden in /opt that gets us a low-priv user shell on the box. For privilege escalation we’re abusing a cronjob tar wildcard within a folder where we have write permission. 

## Nmap

```bash
# Nmap 7.91 scan initiated Wed Sep 22 10:46:04 2021 as: nmap -sC -sV -oN nmap/cmess -p- 10.10.211.176
Nmap scan report for 10.10.211.176
Host is up (0.027s latency).
Not shown: 65533 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 d9:b6:52:d3:93:9a:38:50:b4:23:3b:fd:21:0c:05:1f (RSA)
|   256 21:c3:6e:31:8b:85:22:8a:6d:72:86:8f:ae:64:66:2b (ECDSA)
|_  256 5b:b9:75:78:05:d7:ec:43:30:96:17:ff:c6:a8:6c:ed (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-generator: Gila CMS
| http-robots.txt: 3 disallowed entries 
|_/src/ /themes/ /lib/
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Sep 22 10:46:31 2021 -- 1 IP address (1 host up) scanned in 27.76 seconds
```

Before going to the webserver, there's one thing we're required to do.

![](/assets/images/thm/cmess/2.png)

![](/assets/images/thm/cmess/3.png)
## WebServer

![](/assets/images/thm/cmess/4.png)

Nothing appears out of the order at the first sight, but we do have a copyright that's from 2017, as well as the name of the possible CMS that the website is running on "Gila CMS". First things first, searchsploit it.

![](/assets/images/thm/cmess/5.png)

4 results. Because the copyright on the website says 2017, I’ll go with the last one “Gila CMS < 1.11.1 - Local File Inclusion”.

![](/assets/images/thm/cmess/6.png)

Authenticated, since we haven’t got any type of access we’re not going to dig into it. I went googling in hope that I’ll find something, and I did.

Post: https://infosecdb.wordpress.com/2020/01/05/gilacms-1-11-8-cm-deletet-lfi-local-file-inclusion-and-rce/

![](/assets/images/thm/cmess/7.png)

It says “Authentication: Required” , but let's go for it anyway.

![](/assets/images/thm/cmess/8.png)

Hmm, let’s try the base root.

![](/assets/images/thm/cmess/9.png)

Hey look at that, local file inclusion. Now what can we do with it? I've tried php filters, and quite some ways to obtain remote code execution off of it. Nothing, but a thing I always check when i see a local file inclusion on a webserver that runs apache is “/etc/apache2/sites-available/000-default.conf”, if there’s any virutal host in place, this file will give us quite valuable information, let’s try that.

![](/assets/images/thm/cmess/10.png)

Looks like we’ve got something, dev.cmess.thm. Let's add that to our hosts file and see what’s there.

![](/assets/images/thm/cmess/11.png)

![](/assets/images/thm/cmess/12.png)

I’ve tried logging into the box via ssh with it but it didn’t work. So let’s try it on the admin panel.

![](/assets/images/thm/cmess/13.png)

![](/assets/images/thm/cmess/14.png)

And we get in. We can also see the version of Gila that’s running on. Now our main goal here is to obtain rce. After 2 minutes of googling I’ve stumbled across a post on github.

Post: https://github.com/jkana/Gila-CMS-1.16.0-shell-upload

![](/assets/images/thm/cmess/15.png)

Instead of going 1:1 with that post, I’ll do it my way.

First, one directory up.

![](/assets/images/thm/cmess/16.png)

Then we create a file called whateveryouwant.php (you can literally call it however you want, just make sure it has .php at the end)

In it we put a reverse shell.

![](/assets/images/thm/cmess/17.png)

I’ve already updated the ip and port. After the file has been created, we’re going to overwrite the .htaccess by making a new .htaccess

![](/assets/images/thm/cmess/18.png)

![](/assets/images/thm/cmess/19.png)

Now, the second after we press “Ok” it’ll say Not Found.

![](/assets/images/thm/cmess/20.png)

Now, just go to the base root and type your shell's name. Let’s start a listener first.

![](/assets/images/thm/cmess/21.png)

Now let’s activate the shell by going to the base root + filename.php

![](/assets/images/thm/cmess/22.png)

I got the shell and I’ve stabilized it. After just 20 seconds of poking around I’ve found a hidden file called .password.bak in /opt directory

![](/assets/images/thm/cmess/23.png)

## User

Let’s try to log in via ssh.

![](/assets/images/thm/cmess/24.png)

After checking some basic things I checked /etc/crontab

![](/assets/images/thm/cmess/25.png)

For me, this looks like an easy privesc, since we have write permission in our own home folder, we can abuse the wildcard (*) to get a reverse shell as root on the box, let’s see that in action. :)

![](/assets/images/thm/cmess/26.png)

Now we’re waiting for the connection to be made :D

## Rooted

![](/assets/images/thm/cmess/27.png)

That was it, a fun medium-rated box from tryhackme, hope you enjoyed, thanks for reading.
