const AWS = require('aws-sdk');
const b64 = require('base64-js');
const encryptionSdk = require('@aws-crypto/client-node');
// const { sendWhatsAppOTP } = require('./sendWhatsappOtp');
//Configure the encryption SDK client with the KMS key from the environment variables.
const { encrypt, decrypt } = encryptionSdk.buildClient(encryptionSdk.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
const generatorKeyId = "CognitoOtpEncryptionKey";
const keyIds = [ "arn:aws:kms:ap-south-1:981244829775:key/b7e10abb-ae68-4342-9099-30c93e4a43f7" ];
const keyring = new encryptionSdk.KmsKeyringNode({ generatorKeyId, keyIds })
const axios = require('axios');
// const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const ssm = new AWS.SSM({ region: 'ap-south-1' });

exports.lambdaHandler = async (event) => {
    //Decrypt the secret code using encryption SDK.
    let plainTextCode;
    let otp;
    console.log(event)
    console.log('event.triggerSource=======>', event.triggerSource)
    if(event.request.code){
        const { plaintext, messageHeader } = await decrypt(keyring, b64.toByteArray(event.request.code));
        plainTextCode= plaintext;
        console.log("plainTextCode",plainTextCode)
        let codeAsString = plainTextCode.toString('utf-8');
        otp = codeAsString;  // Convert buffer to string
        console.log("codeAsString",codeAsString)
    }
     if(event.triggerSource === 'CustomSMSSender_SignUp'){
          try {
               console.log('event=======>', event);
               console.log('triggerSource=======>', event.request.userAttributes.phone_number);
               const phoneNumber = event.request.userAttributes.phone_number;
               console.log('OTP===>', otp);
               await sendWhatsAppOTP(phoneNumber, otp);
               console.log('Message sent successfully');
               return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'OTP sent to WhatsApp mobile successfully' })
               };
          } catch (error) {
               console.error('Error sending message:', error);
               return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Failed to send OTP to WhatsApp mobile' })
               };
          }
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





const getParameter = async (parameterName) => {
    const params = {
        Name: parameterName,
        WithDecryption: true
    };
    return await ssm.getParameter(params).promise();
}

async function sendWhatsAppOTP(phoneNumber, otp) {
    let token = await getParameter('WA_TOKEN');
    const url = await getParameter('WHATSAPP_API_URL');
    const ACCESS_TOKEN = token?.Parameter?.Value;
    const WHATSAPP_API_URL = url?.Parameter?.Value;
    console.log('phoneNumber==>OTP==>', {phoneNumber,otp,token,url,ACCESS_TOKEN,WHATSAPP_API_URL});
    try {
        const payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
                name: 'otp_verification',
                language: {
                    code: 'en_US',
                },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            {
                                type: 'text',
                                text: otp
                            }
                        ]
                    },
                    {
                        type: 'button',
                        sub_type: 'url',
                        index: '0',
                        parameters: [
                            {
                                type: 'text',
                                text: otp
                            }
                        ]
                    }
                ]
            }
        };
        // console.log('Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(WHATSAPP_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        throw error;
    }
}