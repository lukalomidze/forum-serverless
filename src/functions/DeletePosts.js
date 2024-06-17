const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require("@azure/storage-blob");

const endpoint = process.env['AZURE_COSMOSDB_ENDPOINT'];
const key = process.env['AZURE_COSMOSDB_ACCOUNT_KEY'];
const databaseName = process.env['AZURE_COSMOSDB_DATABASE_NAME'];
const cosmosContainerName = process.env['AZURE_COSMOSDB_CONTAINER_NAME'];
const blobStorageConnectionString = process.env['AZURE_BLOBSTORAGE_CONNECTION_STRING'];
const blobContainerName = process.env['AZURE_BLOBSTORAGE_CONTAINER_NAME'];

app.timer('DeletePosts', {
    schedule: '0 0 0 * * *',
    handler: async (myTimer, context) => {
        const cosmosClient = new CosmosClient({ endpoint, key });
        const container = cosmosClient.database(databaseName).container(cosmosContainerName);

        try {
            await container.delete();
        } catch (err) {
            context.error('Error deleting cosmosdb container:', err);
        }

        const blobClient = BlobServiceClient.fromConnectionString(blobStorageConnectionString);
        const blobContainerClient = blobClient.getContainerClient(blobContainerName);

        try {
            await blobContainerClient.delete();
        } catch (err) {
            context.error('Error deleting blob container:', err);
        }
    }
});
