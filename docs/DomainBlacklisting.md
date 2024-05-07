# Domain Blacklisting
Tesseract can deny submissions (currently only in the post URL) to a set of admin-defined list of domains.  

## Blacklist Types
There are 3 independent blacklists which can be specified:

- General
- Link Shorteners
- Fake news

There is also an option to deny submitting links to domains MBFC has flagged as "fake news" and low credibility.  Unfortunately, this is all-or-nothing and cannot be configured on a per-community basis.

Each of those lists has a unique reason if it is denied during validation.  You _can_ just use the general list for everything, but utilizing the other two will be more informative to users who submit a link to a blacklisted domain.

This method will not prevent all submissions as it only applies to the Tesseract UI; someone can just use another UI or the API to submit things that are blocked here. Regardless, it's at least attempting to address the problem and can be educational for the casual / naive poster.




## Configuration Example
By default, all of the blacklists are disabled unless explicitly configured and enabled by the admin.  The fake news, low cred sources, and link shorteners need to be explicitly enabled while the domain blacklist will be applied automatically if the admin defines any domains.

A list of link shorteners comes included/hardcoded.  You can add more if need be or override that list by adding them to the link shortener allow list.

```yaml
      # Domain blacklisting tests
      - PUBLIC_BLACKLIST_DENY_FAKE_NEWS=true
      - PUBLIC_BLACKLIST_DENY_LOW_CRED_MBFC=true
      - PUBLIC_BLACKLIST_DENY_LINK_SHORTENERS=true

      # General purpose blacklist (be sure to add the trailing commas in the multi-line YAML.
      - |-
        PUBLIC_DOMAIN_BLACKLIST=
          google.com,
          bing.com
      
      # Counterfeit news websites used to spread disinformation
      - |-
        PUBLIC_FAKE_NEWS_BLACKLIST=
          www.infoterkiniviral.com,
          tass.com
      # These link shorteners are already on the list,  but using them here for example
      - |-
        PUBLIC_LINK_SHORTENER_BLACKLIST=
          bit.ly,
          goo.gl
      
      # These are on the default deny list for link shorteners, but we want to allow them
      - |-
        PUBLIC_LINK_SHORTENER_ALLOWLIST=
          apple.news,
          archive.ph
```

## Why Block Link Shorteners?
Several reasons. 

1) They're pretty pointless on a medium where you can just click the link.  
1) They obfuscate the target and can be used for anything from spreading malware, evading bans/filters, spreading fake news/propaganda, etc.
1) They are sometimes ephemeral and will no longer work after a period of time
1) They often are used to track clicks 
1) They can sometimes be altered later. e.g. a short link to a legitimate site can be later stealth edited to point somewhere bad.
1) Did I mention how pointless they are when you can just _click the link_? 

### Default List of Link Shorteners
Archive sites, Apple News, etc. are included here because they are frequently used to obfuscate the source of a news article.  Sources should _always_ be readily visible for any given news headline so the reader knows where the information is coming from and whether it should be regarded as trustworthy.  

e.g. Apple News for example, just redirects to the official article link via an Apple URL; they do not host any news themselves.  Thus, it is a link shortener / source obfuscator and is included in this list as such.

You are free to disagree with that, but you will need to define the environment variables to remove those from the link shortener blacklist or choose to not enable that list; it is disabled by default.

```
    'apple.news',
    'archive.is',
    'archive.ph',
    'bit.ly',
    'bl.ink',
    'ghostarchive.org',
    'goo.gl',
    'ow.ly',
    'rb.gy',
    'short.cm',
    'tinyurl.com',
    'web.archive.org',
    'zpr.io',
```