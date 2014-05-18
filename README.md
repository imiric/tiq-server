tiq-server
==========

This is an HTTP API server for [tiq](https://github.com/imiric/tiq).

It's essentially an HTTP interface to interacting with `tiq` data stored in
PostgreSQL using [tiq-db](https://github.com/imiric/tiq-db).


Setup
-----

### Docker

Clone this repo and run:

```
$ make build
```

This will download and setup three [Docker](https://www.docker.io/) containers
with Ubuntu 14.04: one for PostgeSQL, one for nginx and one for tiq-server.

To start the servers run:
```
$ make
```
... which will make tiq-server (proxied behind nginx) available on
http://localhost:8000/.

If you wish to change the port, run:

```
$ make PORT=<number>
```

You can stop all containers with `make stop`.


### Manual

This is more complicated, but essentially `npm install -g tiq-server`, install
PostgreSQL (and optionally nginx), and configure and start everything manually.

Save yourself the trouble, and just use Docker. :)


Usage
-----

The API accepts and returns only JSON encoded data.

Here's how you add some tags to some text:

```
POST / HTTP/1.1
Content-Type: application/json

{"tokens":["This too shall pass."],"tags":["quotes","inspiring"]}
```

To tag some URLs:

```
POST / HTTP/1.1
Content-Type: application/json

{"tokens":["http://duckduckgo.com/"],tags":["url","search","awesome"]}
```

```
POST / HTTP/1.1
Content-Type: application/json

{"tokens":["http://www.bing.com/"],"tags":["url","search","microsoft"]}
```

```
POST / HTTP/1.1
Content-Type: application/json

{"tokens":["http://www.reddit.com/"],"tags":["url","timewaster","funny"]}
```

Then, to recall stuff tagged with `search`:
```
GET /?tags=search HTTP/1.1
```
->
```
{"status":"success","data":["http://duckduckgo.com/", "http://www.bing.com/"]}
```

... or both `search` and `awesome`:
```
GET /?tags=search&tags=awesome HTTP/1.1
```
->
```
{"status":"success","data":["http://duckduckgo.com/"]}
```

Or to get the tags associated with a token:
```
GET /?tags=http://duckduckgo.com/ HTTP/1.1
```
->
```
{"status":"success","data":["url","search","awesome"]}
```

Note that the string MAY be encoded (e.g. `/?tags=http%3A%2F%2Fduckduckgo.com%2F`),
which should return the same result.


You can also tag multiple things at once:
```
POST / HTTP/1.1
Content-Type: application/json

{"tokens":["http://www.engadget.com/","http://www.theverge.com/"],"tags":["url","tech"]}
```

Doing the reverse is equivalent to the above:
```
POST / HTTP/1.1
Content-Type: application/json

{"tags":["http://www.engadget.com/","http://www.theverge.com/"],"tokens":["url","tech"]}
```


By default, the `public` namespace is used if none is specified. But you can
use any other namespace you want to partition the data. For example:
```
POST /john HTTP/1.1
Content-Type: application/json

{"tokens":"http://myprivateblog.com/","tags":["url","blog"]}
```

Now to get things tagged with `url` under the `john` namespace:
```
GET /john?tags=url HTTP/1.1
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
