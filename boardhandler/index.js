const AWS = require('aws-sdk');
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({ region: "us-east-1" });
const command = new InvokeCommand({
    FunctionName: "getBoard"
});

exports.handler = async function (event, context) {

    console.log(1);
    const response = await client.send(command);
    console.log("payload: " + response.Payload);
    console.log("type: " + typeof (response.Payload));
    console.log("payload[0]: " + response.Payload[0]);
    console.log("type[0]: " + typeof (response.Payload[0]));
    console.log("length: " + response.Payload.length);

    const buffer = Buffer.from(Object.values(response.Payload));

    return {
        statusCode: 200,
        Data: buffer
    };
}    