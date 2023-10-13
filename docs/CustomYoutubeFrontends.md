# Defining Custom Invidious and Piped Instances

The internal list of Piped and Invidious instances is populated from their respective recommended instances list. If needed, you can provide your own list of custom instances by setting the appropriate environment variables in the docker-compose file. 

**Notes**:  
1. Only server administrators can add custom instances.  There is not yet a way for users to do this at a profile level.
1. Invidious instance list is used to detect Invidious links as well as select a YouTube frontend.
1. Piped instance list is only used for Piped link detection. Using it as a frontend for embeds does not perform well.

## Environment Variables

### Invidious
**PUBLIC_CUSTOM_INVIDIOUS**
```
Values: Comma-delimited string
Default:  ''
Example:  PUBLIC_CUSTOM_INVIDIOUS=inv.example.com,invidious.example2.com
```
### Piped
**PUBLIC_CUSTOM_PIPED**
```
Values: Comma-delimited string
Default:  ''
Example:  PUBLIC_CUSTOM_PIPED=piped.example.com,video.example2.com
```
If you want to define many in your compose file, you can use the multi-line YAML syntax. Just remember to add trailing commas after each entry.


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