FROM dockerfile/nodejs
MAINTAINER Ivan Miric <imiric@gmail.com>

RUN apt-get update && apt-get install -y build-essential libpq-dev python

RUN npm install -g tiq-server

CMD ["tiq-server"]

EXPOSE 8000
