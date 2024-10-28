# Defining Custom Invidious and Piped Instances

The internal list of Piped and Invidious instances is populated from their respective recommended instances list. If needed, you can provide your own list of custom instances by setting the appropriate environment variables in the docker-compose file. 

**Notes**:  
The custom instances defined by admins will only be used for detection of Invidius/Piped links.  As of 1.4.20, and due to Google's war against alternate YouTube frontends and many of the public instances being broken, if a user wants to use an alternate YT frontend, they **must** define their own in the app settings.


## Environment Variables

### Invidious
**PUBLIC_CUSTOM_INVIDIOUS**
```
Values: Comma-delimited string
Default:  ''
Example:  PUBLIC_CUSTOM_INVIDIOUS=inv.example.com,invidious.example2.com
```
### Piped (Deprecated)
**PUBLIC_CUSTOM_PIPED**
```
Values: Comma-delimited string
Default:  ''
Example:  PUBLIC_CUSTOM_PIPED=piped.example.com,video.example2.com
```
If you want to define many in your compose file, you can use the multi-line YAML syntax. Just remember to add trailing commas after each entry.

**Note**:  `PUBLIC_CUSTOM_PIPED` variable has been marked deprecated as of 1.4.20.  Until it's removed, it will simply be combined with the `PUBLIC_CUSTOM_INVIDIOUS` list.


## Compose File Using Multi-Line Syntax
```
  tesseract:
    image:  ghcr.io/asimons04/tesseract:latest
    ports:
      - 8080:3000
    volumes:
      - ./data/tesseract-cache:/app/cache
    environment:
      ...
      - |-
        PUBLIC_CUSTOM_INVIDIOUS=
          inv.example.com,
          invidious.example.com,
          i.example.com
      - |-
        PUBLIC_CUSTOM_PIPED=
          piped.example.com,
          p.example.com
          
```