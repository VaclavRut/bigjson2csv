## Description

If you are looking for a solution that will convert your big JSON (array of JSON objects) to a CSV/Excel in JS, this is a droid you are looking for. Paste to the input an URL for a JSON and name of the dataset where we will store the records.  You can provide more than 1 URL for the JSON, see input example.  Actor is using our dataset to handle the converting the items, we just simply push items to the dataset and then download the whole dataset. Apify do the magic for us.

How to use it?
1) Create account here http://apify.com/
2) Go to the detail of this actor and add it to your account https://www.apify.com/vaclavrut/bigjson2csv
3) Put on input the url and name of the dataset and press run.

## Code
```
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
```

## Actor expects the file on the input in this structure:

```
[{
	"name":"Here is a name of the object 1.",
	"value1": 1,
	"value2":2,
	"end":"Thanks for watching!"
},
{
	"name":"Here is a name of the object 2.",
	"value1": 1,
	"value2":2,
	"end":"Thanks for watching!"
}]
```