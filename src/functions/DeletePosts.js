const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env['AZURE_COSMOSDB_ENDPOINT'];
const key = process.env['AZURE_COSMOSDB_ACCOUNT_KEY'];
const databaseName = process.env['AZURE_COSMOSDB_DATABASE_NAME'];
const containerName = process.env['AZURE_COSMOSDB_CONTAINER_NAME'];

app.timer('DeletePosts', {
    schedule: '0 0 * * * *',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');
        
        const client = new CosmosClient({ endpoint, key });
        const container = client.database(databaseName).container(containerName);

        await container.delete()
    }
});
