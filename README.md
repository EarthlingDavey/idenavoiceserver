# voice-server

How to check if everything is working?

Visit http://localhost/neo4j/browser/

connect to: bolt://localhost:7687
user: neo4j
pw: pass123 (set in `neo4j/.env`)

## installing lets-incrypt

domains='abc.com'
email=''

chmod +x init-letsencrypt.sh
sudo ./init-letsencrypt.sh

## dev notes

update rpc node version on server

`docker-compose down rpc`

`docker-compose rm rpc`

`docker volume rm idenavoiceserver_cache`

`docker-compose build --no-cache rpc`

`docker-compose up -d rpc`
