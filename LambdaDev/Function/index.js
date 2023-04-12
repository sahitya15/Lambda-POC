const AWS = require('aws-sdk');

const stepfunctions = new AWS.StepFunctions();

exports.handler = async (event, context) => {

  if(event.awslogs) {
      const encryptedData = event.awslogs.data !== undefined ? event.awslogs.data : '';
      console.log(event.awslogs);
      console.log('encryptedData', encryptedData);

      // Set the region and credentials for the AWS SDK
      AWS.config.update({region: 'us-east-1a'});
      AWS.config.credentials = {
        accessKeyId: 'AKIA3V6PYECE4TAK3BNP',
        secretAccessKey: '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'
      };
    
      // The encrypted message and the ID of the KMS key used for encryption
      const encryptedMessage = encryptedData; // The encrypted message in base64 format
      const kmsKeyId = '4b86b61e-8815-446a-bdea-b64a8a0f7676'; // The ID of the KMS key used for encryption
    
      // Create an instance of the KMS client
      const kms = new AWS.KMS();
    
      // Decrypt the data key using KMS
      const eventData = await decryptData(kms, kmsKeyId, encryptedMessage);
    
      console.log('decrypt Org', eventData);
     console.log('decrypt res', eventData.response);
    }
    // const executionParams = 'arn:aws:states:us-east-1:803057705097:stateMachine:MyMachineSalesforce';
    //   stepfunctions.stopExecution(executionParams, function(err, data) {
    //     if (err) console.log(err, err.stack);
    //     else console.log(data);
    //   });

      // const dummyData = {
      //   tableName : 'conatct',
      //   column : 'contact_firstname',
      //   data : 'testuser1',
      // }
    
      // const params = {
      //   stateMachineArn: executionParams,
      //   // input: eventData.response.data !== null ? JSON.stringify(eventData.response.data) : JSON.stringify(dummyData)
      //   // input: JSON.stringify(dummyData)
      //   input: JSON.stringify({
      //     destination: 'Salesforce',
      //     dummyData
      //   })
      // };
    
    // try {
    //   const stepData = await stepfunctions.startExecution(params).promise();
    //   const response = {
    //       "statusCode": 200,
    //       "body": {
    //         "rds_data": {
    //           "destination": "Salesforce",
    //           "data" : "xyz"
    //         },
    //         "data" : {
    //         "rds_data": {
    //           "destination": "Salesforce",
    //           "data" : "xyz"
    //         }
    //         }
    //       },
    //       "rds_data": {
    //         "destination": 'Salesforce',
    //         "data" : stepData
    //       },
    //       "data" : {
    //         "rds_data": {
    //           "destination": "Salesforce",
    //           "data" : dummyData
    //         },
    //         }
    //   };
    //   return response;
    // } catch (err) {
    //   console.log(err);
    // }
  }

async function decryptData(kms, kmsKeyId, encryptedMessage) {
  const params = {
    CiphertextBlob: Buffer.from(encryptedMessage, 'base64'),
    KeyId: kmsKeyId
  };
  const decryptKMS = kms.decrypt(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      // The decrypted data key
      const dataKey = data.Plaintext;
  
      // Decrypt the message using the data key and AES
      const crypto = require('crypto');
      const decipher = crypto.createDecipheriv('aes-256-cbc', dataKey, Buffer.alloc(16));
      let decrypted = decipher.update(Buffer.from(encryptedMessage, 'base64'));
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    }
  });

  return decryptKMS;
}