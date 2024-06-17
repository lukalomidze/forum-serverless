const { app } = require('@azure/functions')
const { CosmosClient } = require('@azure/cosmos')
const { BlobServiceClient } = require("@azure/storage-blob")

const endpoint = process.env['AZURE_COSMOSDB_ENDPOINT']
const key = process.env['AZURE_COSMOSDB_ACCOUNT_KEY']
const databaseName = process.env['AZURE_COSMOSDB_DATABASE_NAME']
const cosmosContainerName = process.env['AZURE_COSMOSDB_CONTAINER_NAME']
const blobStorageConnectionString = process.env['AZURE_BLOBSTORAGE_CONNECTION_STRING']
const blobContainerName = process.env['AZURE_BLOBSTORAGE_CONTAINER_NAME']

app.timer('DeletePosts', {
    schedule: '0 0 0 * * *',
    handler: async (myTimer, context) => {
        const cosmosContainer = new CosmosClient({ endpoint, key })
            .database(databaseName)
        .container(cosmosContainerName)

        try {
            const { resources: documents } = await cosmosContainer.items.readAll().fetchAll()

            for (const document of documents) {
                await cosmosContainer.item(document.id, document.partitionKey).delete()
            }
        } catch (err) {
            context.error('Error deleting cosmosdb container items: ', err)
        }

        const blobContainerClient = BlobServiceClient
            .fromConnectionString(blobStorageConnectionString)
        .getContainerClient(blobContainerName)

        try {
            for await (const blob of blobContainerClient.listBlobsFlat()) {
                await blobContainerClient.deleteBlob(blob.name)
            }
        } catch (err) {
            context.error('Error deleting blob container items: ', err)
        }
    }
})
