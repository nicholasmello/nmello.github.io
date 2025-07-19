---
title: "Try my game"
date: 2025-07-19 13:00:00 -0500
categories: [Security]
tags: [malware, Discord, reverse engineering]
---

## Introduction

You get a message from a friend on Discord:
> "Hey! I just finished my first game, would you mind trying it out and giving
> feedback?"

At first glance, it seems harmless and honestly, pretty believable. A lot of
people in dev and gaming communities *do* make and share their games. I’ve had
plenty of friends send me early builds, so this sort of message wouldn’t raise a
red flag by itself.

By now, most of us have seen this kind of trick before. Discord even puts up a
banner saying "Watch out for stolen accounts" when it detects an account it
thinks might have been compromised. In Discord's safety tips for common scams,
"Try my game" is one of the 3 specific scams that are called out.

Yesterday evening, it happened to me again. I got a message from a friend on
Discord:
> I've been working on a small project with few friends for four weeks, 2d
> adventure one

> can you take a look and give your review

> 4-5 mins

The developer in me immediately starts asking questions about the game engine
being used and if he has published the source code to look at. After somewhat
suspicious answers I was sent a link to a game on blogspot.com... this account
has been hacked.

## Preparation for Analysis

The website consisted of a few generic paragraphs describing a 2D platformer
with a GIF and 4 other pictures of a game being played. At the bottom of the
page was a download button that linked to a dropbox download of an MSI file.
There was also a comment section that asked for a google sign in that I assumed
was there to steal your google credentials without actually working.

Curious about how the malware worked, I thought of various ways of safely
analyzing the binary. I considered standing up a virtual machine and running the
code to see what it did. After all, vulnerabilities that can escape a virtual
machine is very rare. I decided with a safer approach of trying to figure out
what it does from analysis.

I started up a linux virtual machine with some binary analysis tools and
downloaded the mysterious file.

## Deconstructing the Binary

Microsoft Software Installer (MSI) is a common format for installing software on
windows. It provides a standardized GUI for the user so the software install
process is consistent and easier for users. That means that the first step is to
deconstruct the packaged file and figure out which component the malware is.

A quick search brought me to [msitools](https://www.kali.org/tools/msitools/),
an open source project for gathering info as well as extracting msi files.

```text
Title: Installation Database
Subject: Testuwu
Author: Testuwu
Keywords: Installer
Comments: This installer database contains the logic and data required to install Testuwu.
Template: x64;1033
Revision number (UUID): {0B95233B-335F-4884-A349-F4093D7C6287}
Created: Fri Jul 18 20:15:50 2025
Last saved: Fri Jul 18 20:15:50 2025
Version: 500 (1f4)
Source: 2 (2)
Application: WiX Toolset (4.0.0.5512)
Security: 2 (2)
```

The creator gave it the fun name Testuwu. Running the extract command gave me a
testuwu folder with an executable `Testuwu.exe`, a few dlls including open
source projects like `ffmpeg` and `vulkan`, and a few identifying files. What
caught my eye the most was the LICENSE files for electron and chromium.

[Electron](https://www.electronjs.org/) is a program for bundling web apps as
desktop apps. Electron apps are designed to be bundled, and more importantly,
unbundled easily for ease of development. I found this article, [Decompiling and
repacking Electron
Apps](https://medium.com/@libaration/decompiling-and-repacking-electron-apps-b9bfbc8390d5)
on medium that had the goal of removing ads from an electron app that is used by
League of Legends players. It involves using a node package named `asar` to
extract the contents of the app.

## Digging into the Source

Searching for asar files in the MSI output I found one in the testuwu
"resources" folder. The output of this file was a `package.json` file and a
bunch of obfuscated javascript file names.

```json
{
  "name": "testuwu",
  "version": "1.0.0",
  "description": "Best games ever",
  "main": "4fae8eaf11be1583.js",
  "author": "Testuwu",
  "publisher": "Copyright © namefile",
  "license": "MIT",
  "dependencies": {
    "@primno/dpapi": "^1.1.2",
    "adm-zip": "^0.5.16",
    "archiver": "^7.0.1",
    "axios": "^1.8.4",
    "form-data": "^4.0.2",
    "fs-extra": "^11.3.0",
    "glob": "^11.0.2",
    "iloverte": "^0.6.1",
    "node-fetch": "^2.7.0",
    "os": "^0.1.2",
    "path": "^0.12.7",
    "regedit": "^5.1.4",
    "screenshot-desktop": "^1.15.1",
    "sqlite3": "^5.1.7",
    "ws": "^8.18.0"
  },
  "copyright": "ColdGames © 2025"
}
```

I started with the main file, `4fae8eaf11be1583.js`, expecting to see a
javascript file with all of the variables obfuscated just like the file names
but what I found was more surprising. The file was a giant set of encrypted data
that gets executed. I replaced the bulk of the data with `TONS OF DATA` for post
length reasons.

```javascript
const crypto = require('crypto');
(function() {
    const _decrypt = (data, key, salt, iv, tag) => {
        const k = crypto.pbkdf2Sync(key, Buffer.from(salt, 'base64'), 1e5, 32, 'sha512');
        const d = crypto.createDecipheriv('aes-256-gcm', k, Buffer.from(iv, 'base64'));
        d.setAuthTag(Buffer.from(tag, 'base64'));
        let out = d.update(data, 'base64', 'utf8');
        out += d.final('utf8');
        return out;
    };
    const _result = _decrypt(
        "TONS OF DATA",
        "fffWiNX8HJrec6vLoIVhQw==",
        "ar+wqnHyai/JXLJLRLWgeg==",
        "TcNbBm109XYWnDoXcBCkxQ=="
    );
    eval(_result);
})();
```

Luckily, the decryption key must be stored with the data in this binary if it
wants to be able to run on someones computer as malware. Since it is already
self decrypting to run itself, I replaced `eval(_result)` with
`console.log(_result)` and redirected the output to a file.

To my surprise, this decrypted code was not obfuscated and I could read exactly
what was going on. It appeared to be looking for Discord, Steam, Epic Games,
etc. for any service it could steal the user's info to propagate further. This
includes 2FA backup codes. It also gathered personal information about the user
including system specs and location data. It also looked through each browser
that could be installed on a system and took its cookies for sign in data and
any stored passwords.

It is one thing to collect all this data, but it needs to be sent off of the
system somehow. Looking for links I found a few interesting options. There were
2 Discord webhooks and a telegram chat.

The data was being compiled and sent to a Discord webhook which is unfortunately
a really good way to reduce traceability. This is because Discord webhooks
cannot be tied back to an account (at least for me who does not work at Discord)
and even if they could be tied back you can always create another account.
Additionally, Discord webhooks can be deleted and recreated easily if one is
compromised.

## What now?

Now that I know how this all works, what can be done to stop or slow down the
scammer from taking peoples accounts and data? My first reaction was webhooks
offer no validation so any data can be sent over them. This means you could
create a python script like this to send fun sentences.

```python
subjects = ["The system", "Our team", "This process", "The solution", "The platform"]
verbs = ["enables", "facilitates", "integrates", "leverages", "automates"]
objects = ["new opportunities", "optimized workflows", "real-time analytics", "enhanced performance", "scalable architecture"]
connectors = ["to deliver", "by providing", "that accelerates", "which supports", "and enhances"]
endings = ["measurable results.", "user satisfaction.", "digital transformation.", "strategic growth.", "core functionality."]

def generate_sentence():
    return f"{random.choice(subjects)} {random.choice(verbs)} {random.choice(objects)} {random.choice(connectors)} {random.choice(endings)}"

def generate_paragraph(num_sentences=5):
    return "".join(generate_sentence() for _ in range(num_sentences))


# Replace this with your actual Discord webhook URL
webhook_url = 'https://discord.com/api/webhooks/'

paragraph = generate_paragraph()

# Message payload
data = {
    "content": paragraph
}

print(f"Sending Paragraph: {paragraph}")

# Send the POST request
response = requests.post(webhook_url, json=data)

# Check response status
if response.status_code == 204:
    print("Message sent successfully.")
else:
    print(f"Failed to send message. Status code: {response.status_code}")
    print(f"Response text: {response.text}")
```

This would fill up their Discord messages with random data to make it harder to
find actual peoples data and probably lead to the webhook being shut off.

## Deleting Webhooks

As fun as sending those messages would be, the underlying problem is it is not
actually stopping the person running the malware from getting the information.
It just slightly slows them down by making them scroll.

While looking into Discord webhooks I came across [Discord Webhook
Invalidator](https://discordlookup.com/webhook-invalidator) which claims to
"Immediately delete a Discord webhook to eliminate evil webhooks." This is just
what I was looking for but is that something you can really do. I put in the URL
and sure enough, the webhook was no longer reachable.

This shows a lack of understanding for me about webhooks but it makes sense.
Since there is no authentication on webhooks to use them they can also be
deleted with a simple request. [Searching
github](https://github.com/topics/webhook-deleter) there are many such tools.
This is probably the best that can be done to stop the malware from spreading.

I reported the dropbox link to dropbox as malware but I imagine the link is
moved by the time dropbox can react to the report and take it down.

## Conclusion

I mentioned when reading through the source code of the malware was a `t.me`
telegram link to a group chat. I downloaded telegram and restricted my settings
to give no personal information and joined the chat. The chat was a place to
purchase the malware I had been analyzing this whole time. There were
screenshots of how the output looks as well as analysis showing it makes it past
many common anti-virus software. While this is all interesting information, I
don't know what to do with it so let me know if you have any ideas!

There was no particular care put into hiding this code. Everything was meant to
be scrapped as soon as he gets the information he needs. There’s something
frustrating about how lazily this was thrown together and how effective it still
manages to be. The social engineering does most of the work. A believable
message from a trusted friend is all it takes for many accounts to get hacked
every day.

Reverse engineering this sample made it clear how little effort is needed to
build something dangerous and how much power a basic Electron wrapper still
holds. The tools for inspecting these binaries are readily available, and with a
bit of curiosity, it’s possible to peel back every layer. Remember to be
cautious around unknown or known malicious binaries and take the proper
precautions.
