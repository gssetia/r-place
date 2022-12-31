const AWS = require('aws-sdk');
      const ddb = new AWS.DynamoDB.DocumentClient();
      exports.handler = async function (event, context) {
        try {
          await ddb
            .put({
              TableName: process.env.table,
              Item: {
                connectionId: event.requestContext.connectionId,
                connectionIp: event.requestContext.identity.sourceIp,
              },
            })
            .promise();
        } catch (err) {
          console.log(err)
          return {
            statusCode: 500,
          };
        }
        try {
          await ddb
            .put({
              TableName: process.env.requests,
              Item: {
                connectionIp: event.requestContext.identity.sourceIp,
                time: event.requestContext.requestTime,
                lastRequest: 1,
              },
              ConditionExpression: "attribute_not_exists(connectionIp)",
            })
            .promise();
        } catch (err) {
            console.log("Connection already exists")
        }
        return {
          statusCode: 200,
        };

      };