const Apify = require('apify');
const rp = require('request-promise')
const Promise = require('bluebird')
const ApifyClient = require('apify-client');

Apify.main(async () => {

    const input = await Apify.getValue('INPUT');
    const environmentVariables = await Apify.getEnv()

    const apifyClient = new ApifyClient({
        userId: environmentVariables.userId,
        token: environmentVariables.token
});
    const datasets = apifyClient.datasets;

    await Promise.map(input.urls, async (solve) => {

        if (!solve.name || !solve.url) throw new Error('Invalid input! Please provide combination of name and url');

        const inputData = await rp({uri: solve.url});

        const dataset = await datasets.getOrCreateDataset({
            datasetName: solve.name + environmentVariables.actRunId,
        });

        const parsedData = JSON.parse(inputData);
        console.log("Loaded", parsedData.length, " for ", solve.name);

        while (parsedData.length) {
            console.log("Remaining records for", solve.name, " is: ", parsedData.length)
            await datasets.putItems({datasetId: dataset.id,data: parsedData.splice(0, 1000)});
        }
        console.log(solve.name," finished.")
        console.log("Download a CSV : https://api.apify.com/v2/datasets/" + dataset.id + "/items?format=csv&attachment=1");
        console.log("Download a XLSX : https://api.apify.com/v2/datasets/" + dataset.id + "/items?format=xlsx&attachment=1");

    }, {concurrency: 10})

    console.log("Job finished, see you next time.");
});
