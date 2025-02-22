const axios = require('axios');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-south-1' });
const ssm = new AWS.SSM({ region: 'ap-south-1' });

const getParameter = async (parameterName) => {
    const params = {
        Name: parameterName,
        WithDecryption: true
    };
    return await ssm.getParameter(params).promise();
}

export async function sendWhatsAppOTP(phoneNumber, otp) {
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