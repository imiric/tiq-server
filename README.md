tiq-server
==========

This is an HTTP API server for [tiq](https://github.com/imiric/tiq).

It's essentially an HTTP interface to interacting with `tiq` data stored in
PostgreSQL using [tiq-db](https://github.com/imiric/tiq-db).


Setup
-----

TBD


Usage
-----

The API accepts and returns only JSON encoded data.

Here's how you add some tags to some text:

```
POST /public/This%20too%20shall%20pass. HTTP/1.1
Content-Type: application/json

["quotes","inspiring"]
```

To use it as a bookmarking tool:

```
POST /public/http://duckduckgo.com/ HTTP/1.1
Content-Type: application/json

["url","search","awesome"]
```

```
POST /public/http://www.bing.com/ HTTP/1.1
Content-Type: application/json

["url","search","microsoft"]
```

```
POST /public/http://www.reddit.com/ HTTP/1.1
Content-Type: application/json

["url","timewaster","funny"]
```

Then, to recall stuff tagged with `search`:
```
GET /public/search HTTP/1.1
```
->
```
{"status":"success","data":["http://duckduckgo.com/", "http://www.bing.com/"]}
```

... or both `search` and `awesome`:
```
GET /public/search,awesome HTTP/1.1
```
->
```
{"status":"success","data":["http://duckduckgo.com/"]}
```

You can change the default tag separator (`','`) with the `separator` query
string argument:

```
GET /public/search|awesome?separator=| HTTP/1.1
```
->
```
{"status":"success","data":["http://duckduckgo.com/"]}
```

The `public` part of the URL is the namespace used to partition the data.
You can use any other namespace you want:
```
POST /john/http://myprivateblog.com/ HTTP/1.1
Content-Type: application/json

["url"]
```

Now to get things tagged with `url` under the `john` namespace:
```
GET /john/url HTTP/1.1
```
->
```
{"status":"success","data":["http://myprivateblog.com/"]}
```


Configuration
-------------

The configuration file by default is expected in `$XDG_CONFIG_HOME/tiq-server/config.json`
(where `$XDG_CONFIG_HOME` is `$HOME/.config`).

TBD

License
-------

[MIT](LICENSE)
