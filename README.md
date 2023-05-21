# CodeWars API results server
[![CircleCI](https://circleci.com/gh/aslepenkov/codewars-results-server/tree/master.svg?style=svg)](https://circleci.com/gh/aslepenkov/codewars-results-server/tree/master)
backend for https://github.com/aslepenkov/yandex-js-dashboard

## Features

-   Fetches results of all CodeWars participants from `playersReal.json`
-   Sorts by the number of completed tasks from `slugs.json`
-   Sorts by time difference from leader
-   Caches results
-   Updates every 20 minutes
-   Endpoint items at `https://{host}/api/items`

## TODO

-   [x] add lint
-   [x] host heroku
-   [x] add cache
-   [ ] add json hot reload
-   [ ] add tests
-   [ ] read multi-page players

### playersReal.json

```json
{
    "data": [
        {
            "real": "Алексей Слепенков",
            "nick": "4slepenkov"
        }
    ]
}
```

### slugs.json

```json
{
    "data": [
        {
            "name": "how-good-are-you-really",
            "expiryDate": "Wed, 14 Aug 2019 19:00:00 GMT+0700",
            "startDate": "Wed, 31 Jul 2019 19:00:00 GMT+0700"
        }
    ]
}
```

### items.json

```json
[
    {
        "playerName": {
            "real": "Алексей ",
            "nick": "slepenkov"
        },
        "doneCount": {
            "done": 22,
            "max": 22
        },
        "diffTime": "2.5k",
        "_cellVariants": {
            "lazy-repeater": "success"
        },
        "how-good-are-you-really": "+135:32"
    }
]
```
