# voice-server

update rpc node version on server

`docker-compose down rpc`

`docker-compose rm rpc`

`docker volume rm idenavoiceserver_cache`

`docker-compose build --no-cache rpc`

`docker-compose up -d rpc`
