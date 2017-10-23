# Cryptofolio backend
## Start database

First run

    docker volume create crypto-storage
    docker run --name crypto-database -d -p 5432:5432 -v crypto-storage:/var/lib/postgresql/data postgres:9.6

Later runs 

    docker start crypto-database


## Start server

    npm run watch
    
## admin login
user: admin
password: testEthereum!

user kun je toevoegen in user.json file

## Jobs

|   Job Name   |   Job description   |   Analyse   |
|   --   |   --   |   --   |
|   CheckPricesJob   |   Makes webrequest to get the most recent prices of all crypto's. Stores the result in the database   |   #6
|   CheckTotalsJob   |   Recalculates the total for each account, using prices from a given time. This job is triggered after the CheckPricesJob   |   #7
|   MonitorLastEthereumBlock   |   Periodically checks the last un-parsed ethereum blocks, and imports all erc20 transactions for the existing erc20 crypto's   |   #8
|   ImportErc20TransactionsJob   |   Intial import of erc20 coins through ethereum json-rpc api   |   #9   |
|   ImportAccountTransactionsJob   |   Initial import of transactions belonging to an account. They are either loaded from a web api (bitcoin, ltc, doge, ...), or from the internal erc20transaction records   |   #10
