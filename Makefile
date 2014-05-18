SHELL := /bin/bash

.PHONY: start stop build

PORT?=8000
DBUSER?=postgres
DBPASS?=postgres
DBSCHEMA?=postgres
DBNAME?=tiq

start:
	@docker start tiq-postgres 2> /dev/null || \
		docker run -d --name tiq-postgres -e USER=$(DBUSER) -e PASSWORD=$(DBPASS) \
		-e SCHEMA=$(DBSCHEMA) jamesbrink/postgresql
	@# Run a temporary container to create the database
	@# Wait a few seconds to allow the PostgreSQL container to start
	@sleep 5 && docker run --rm --link tiq-postgres:db \
		-e PGPASSWORD=$(DBPASS) -e PGUSER=$(DBUSER) -e PGHOST=db \
		jamesbrink/postgresql createdb $(DBNAME) 2> /dev/null || true
	@docker start tiq-server 2> /dev/null || \
		docker run -d --name tiq-server --link tiq-postgres:db imiric/tiq-server
	@docker start tiq-nginx 2> /dev/null || \
		docker run -d --name tiq-nginx -p $(PORT):80 --link tiq-server:tiq \
		-v $(CURDIR)/deploy:/etc/nginx/sites-enabled \
		-v /var/log/nginx:/var/log/nginx dockerfile/nginx

stop:
	@docker stop tiq-nginx tiq-server tiq-postgres

build:
	@docker pull jamesbrink/postgresql
	@docker pull dockerfile/nginx
	@docker build -t imiric/tiq-server .
