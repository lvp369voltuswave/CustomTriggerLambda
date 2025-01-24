const AWS = require('aws-sdk');
const b64 = require('base64-js');
const encryptionSdk = require('@aws-crypto/client-node');
//Configure the encryption SDK client with the KMS key from the environment variables.
const { encrypt, decrypt } = encryptionSdk.buildClient(encryptionSdk.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
const generatorKeyId = "CognitoOtpEncryptionKey";
const keyIds = [ "arn:aws:kms:ap-south-1:981244829775:key/b7e10abb-ae68-4342-9099-30c93e4a43f7" ];
const keyring = new encryptionSdk.KmsKeyringNode({ generatorKeyId, keyIds })
exports.lambdaHandler = async (event) => {
    //Decrypt the secret code using encryption SDK.
    let plainTextCode;
    console.log(event)
    if(event.request.code){
        const { plaintext, messageHeader } = await decrypt(keyring, b64.toByteArray(event.request.code));
        plainTextCode= plaintext;
        console.log("plainTextCode",plainTextCode)
        let codeAsString = plainTextCode.toString('utf-8');  // Convert buffer to string
        console.log("codeAsString",codeAsString)
    }
    //PlainTextCode now contains the decrypted secret.
    if(event.triggerSource == 'CustomEmailSender_SignUp'){
        //Send an email message to your user via a custom provider.
        //Include the temporary password in the message.
    }
    else if(event.triggerSource == 'CustomEmailSender_Authentication'){
         //Send an MFA message.
    }
    else if(event.triggerSource == 'CustomEmailSender_ResendCode'){
         //Send a message with next steps for password reset.
    }
    else if(event.triggerSource == 'CustomEmailSender_ForgotPassword'){
         //Send a message with next steps for password reset.
    }
    else if(event.triggerSource == 'CustomEmailSender_UpdateUserAttribute'){
         //Send a message with next steps for confirming the new attribute.
    }
    else if(event.triggerSource == 'CustomEmailSender_VerifyUserAttribute'){
         //Send a message with next steps for confirming the new attribute.
    }
    else if(event.triggerSource == 'CustomEmailSender_AdminCreateUser'){
         //Send a message with next steps for signing in with a new user profile.
    }
    else if(event.triggerSource == 'CustomEmailSender_AccountTakeOverNotification'){
         //Send a message describing the threat protection event and next steps.
    }
    return;
};