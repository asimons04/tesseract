## Configuring
The following environment variables can be set to override the default settings.  Note that all environment variables must be prefixed with `PUBLIC_` to be picked up by SvelteKit.


| Variable                        | Values              | Default Value                          |
| ------------------------------- | ------------------- | -------------------------------------- |
| PUBLIC_INSTANCE_URL             | URL                 | `lemmy.world`                          |
| PUBLIC_LOCK_TO_INSTANCE         | `bool`              | `true` if `PUBLIC_INSTANCE_URL` is set |
| PUBLIC_THEME                    | system\|dark\|light | system                                 |
| PUBLIC_MARK_READ_POSTS          | `bool`              | true                                   |
| PUBLIC_SHOW_COMPACT_POSTS       | `bool`              | false                                  |
| PUBLIC_DEFAULT_FEED_SORT        | `SortType`          | Active                                 |
| PUBLIC_DEFAULT_FEED             | `ListingType`       | Local                                  |
| PUBLIC_DEFAULT_COMMENT_SORT     | `CommentSortType`   | Hot                                    |
| PUBLIC_HIDE_DELETED             | `bool`              | true                                   |
| PUBLIC_HIDE_REMOVED             | `bool`              | false                                  |
| PUBLIC_DISPLAY_NAMES            | `bool`              | true                                   |
| PUBLIC_NSFW_BLUR                | `bool`              | true                                   |
| PUBLIC_OPEN_LINKS_NEW_TAB       | `bool`              | false                                  |
| PUBLIC_ENABLE_EMBEDDED_MEDIA_FEED | `bool`            | true                                   |
| PUBLIC_ENABLE_EMBEDDED_MEDIA_POST | `bool`            | true                                   |
| PUBLIC_YOUTUBE_FRONTEND         | `YouTube`\|`Invidious` | YouTube                             |
| PUBLIC_CUSTOM_INVIDIOUS         | Comma-separated string | ''                                  |
| PUBLIC_CUSTOM_PIPED             | Comma-separated string | ''                                  |
| PUBLIC_ENABLE_USER_MEDIA_PROXY  | `bool`              | false                                  |
| PUBLIC_ENABLE_MBFC_BADGES       | `bool`              | true                                   |
| PUBLIC_STRETCH_CARD_BANNERS     | `bool`              | false                                  |
| PUBLIC_MATCH_XPOST_TITLE        | `bool`              | true                                   |
| PUBLIC_FEATURED_INSTANCES       | Comma-separated string | ''                                  |

See [environment options](./EnvironmentOptions.md) for descripions of each.

### Configuration Options for Media Proxying and Caching
Descriptions of the config options and what they do are covered in the [Media Proxy Cache](./MediaProxy.md) module documentation.

Variable                            | Value                 | Default                            |
---                                 | ---                   | ---                                |
PUBLIC_ENABLE_MEDIA_PROXY           | `bool`                | false                              |
PUBLIC_MEDIA_PROXY_LEMMY_ONLY       | `bool`                | false                              |
PUBLIC_MEDIA_PROXY_BLACKLIST        | String                | ''
PUBLIC_ENABLE_MEDIA_PROXY_LOCAL     | `bool`                | true                               |
PUBLIC_ENABLE_MEDIA_CACHE           | `bool`                | true                               |
PUBLIC_MEDIA_CACHE_DURATION         | Integer (minutes)     | 720                                |
PUBLIC_MEDIA_CACHE_MAX_SIZE         | Integer (MB)          | 1000                               |
PUBLIC_MEDIA_CACHE_HOUSEKEEP_INTERVAL | Integer (minutes)   | 5                                  |
PUBLIC_MEDIA_CACHE_HOUSEKEEP_STARTUP  | `bool`              | true                               |
PUBLIC_MEDIA_CACHE_KEEP_HOT_ITEMS   | `bool`                | true                               |



The values for `SortType`, `ListingType`, and `CommentSortType` are defined by the lemmy-js-client library.  All of the values are case-sensitive and must match as they are defined in the type definitions of the [lemmy-js-client](https://github.com/LemmyNet/lemmy-js-client)

#### Listing Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/ListingType.ts

- All
- Local
- Subscribed
- Moderator View (Don't set as default)

#### Sort Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/SortType.ts

- Active
- Hot
- New
- Old
- Controversial
- TopDay
- TopWeek
- TopMonth
- TopAll
- MostComments
- NewComments
- TopHour
- TopSixHour
- TopTwelveHour 
- TopThreeMonths (Not implemented in Tesseract)
- TopSixMonths (Not implemented in Tesseract)
- TopNineMonths (Not implemented in Tesseract)
- TopYear (Not implemented in Tesseract)

#### Comment Sort Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/CommentSortType.ts
- Hot
- Top
- New
- Old (not implemented in Tesseract)
- Controversial (not implemented in Tesseract)
