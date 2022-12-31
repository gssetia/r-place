const AWS = require('aws-sdk');
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({ region: "us-east-1" });

      const ddb = new AWS.DynamoDB.DocumentClient();
      exports.handler = async function (event, context) {
        let connections;
        let requests;
        let wait = false;
        let epoch = event.requestContext.requestTimeEpoch;
        const message = event.body;
        try {
          connections = await ddb.scan({ TableName: process.env.table }).promise();
          requests = await ddb.scan({ TableName: process.env.requests }).promise();
        } catch (err) {
          return {
            statusCode: 500,
          };
        }
        
        requests.Items.map(async ({ connectionIp, lastRequest }) => {
          console.log("nums", epoch, lastRequest, connectionIp, event.requestContext.identity.sourceIp);
          if (connectionIp === event.requestContext.identity.sourceIp) {
            // 300000 = 60000 miliseconds * 5 min
            if (epoch - lastRequest < 300000 ) {
              wait = true;
            }else{
              const params = {
              TableName: process.env.requests,
              Key: {
                connectionIp: connectionIp,
                },
                ExpressionAttributeNames: { '#T': 'lastRequest' },
                UpdateExpression: "set #T = :T",
                ExpressionAttributeValues: {
                  ':T': epoch,
                }
              };
              try {
                
                ddb.update(params, function(err, data) {
                   if (err) console.log(err);
                   else console.log("Result: ", data);
                });
                console.log("updated");
                const command = new InvokeCommand({
                    FunctionName: "updateBoard",
                    Payload: message
                });
                const response = await client.send(command);
                print(response)
              } catch (err) {
                return {
                  statusCode: 500,
                };
              }
            }

          }
          
        });
        
        const callbackAPI = new AWS.ApiGatewayManagementApi({
          apiVersion: '2018-11-29',
          endpoint:
            event.requestContext.domainName + '/' + event.requestContext.stage,
        });

        if (!wait) {
          const sendMessages = connections.Items.map(async ({ connectionId }) => {
            try {
              console.log(connectionId, message)
              await callbackAPI
                .postToConnection({ ConnectionId: connectionId, Data: message })
                .promise();
            } catch (e) {
              console.log(e);
            }
          });
          try {
            await Promise.all(sendMessages);
          } catch (e) {
            console.log(e);
            return {
              statusCode: 500,
            };
          }
        }

        return { statusCode: 200 };
      };