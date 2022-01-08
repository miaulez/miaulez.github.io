var store = [{
        "title": "0day - Try Hack Me",
        "excerpt":"Hello, and welcome to the write-up for 0day machine on TryHackMe, a medium-rated machine that involved exploiting a shellshock vulnerability, then escalating to root via a kernel exploit. Nmap # Nmap 7.91 scan initiated Mon Sep 13 06:24:27 2021 as: nmap -sC -sV -oN nmap/0day 10.10.115.124 Nmap scan report for...","categories": ["tryhackme","infosec"],
        "tags": ["overlayfs","shellshock","kernel exploit","tryhackme","security","pentesting","CVE-2014-6271"],
        "url": "http://localhost:4000/thm-0day-writeup/",
        "teaser":"http://localhost:4000/assets/images/thm/0day/thumbnail.png"},{
        "title": "Vulnversity - Try Hack Me",
        "excerpt":"Hello, today we’re doing Vulnversity from tryhackme.com , an easy machine aimed for beginners. It involved finding an upload form, then exploiting that poorly secured upload form to obtain a shell on the box. For privilege escalation we found out that there is a suid bit set on systemctl ,...","categories": ["tryhackme","infosec"],
        "tags": ["upload vulnerability","security","pentesting","systemctl"],
        "url": "http://localhost:4000/thm-vulnversity-writeup/",
        "teaser":"http://localhost:4000/assets/images/thm/vulnversity/thumbnail.png"},{
        "title": "CMesS - Try Hack Me",
        "excerpt":"Heyo, today we’re doing Cmess from tryhackme, a medium-rated box that involved finding a local file inclusion, looking at a configuration file to find a subdomain, getting a password for a user that we can log into an admin panel with. For remote code execution we’re abusing an upload form...","categories": ["tryhackme","infosec"],
        "tags": ["tar","gila cms","enumeration","lfi","security","pentesting","CVE-2020-5513"],
        "url": "http://localhost:4000/thm-cmess-writeup/",
        "teaser":"http://localhost:4000/assets/images/thm/cmess/thumbnail.png"},{
        "title": "eCPPTv2 exam review",
        "excerpt":"Heyo, I know I might be a bit late on this, since I’ve taken eCPPT on 2021’s December 1st, but I’ll make this review nonetheless. What is eCPPT? eCPPT stands for eLearnSecurity Certified Professional Penetration Tester, it is a completely hands on exam in which you are required to exploit...","categories": ["infosec"],
        "tags": ["INE","elearnsecurity","pentesting","review","exam","ecppt"],
        "url": "http://localhost:4000/ecppt-review/",
        "teaser":"http://localhost:4000/assets/images/reviews/ecppt/thumbnail.png"},{
        "title": "Debug - Try Hack Me",
        "excerpt":"Hey there, welcome to the write-up for Debug, a TryHackMe box made by ustoun0 which invloves finding a backup directory which has an index.php.bak inside. Doing some code review we can quickly see that the code is vulnerable to php deserialization and we can write a shell on the webserver....","categories": ["tryhackme","infosec"],
        "tags": ["php deserialization","apache hash","ssh banner","privesc","security","pentesting"],
        "url": "http://localhost:4000/thm-debug-writeup/",
        "teaser":"http://localhost:4000/assets/images/thm/debug/thumbnail.png"}]
