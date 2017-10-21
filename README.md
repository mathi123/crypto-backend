# Cryptofolio backend
## Start database

First run

    docker volume create crypto-storage
    docker run --name crypto-database -d -p 5432:5432 -v crypto-storage:/var/lib/postgresql/data postgres:9.6

Later runs 

    docker start crypto-database


## Start server

    npm run watch
