const sendWhatsAppSubscriptionConfirmationMessage = async (
    phoneNumber,
    patientName,
    currency,
    amount,
    programName,
    date
) => {
    console.log('Sending WhatsApp message to:', phoneNumber);

    let token = await PMS_UTIL.getParameter('WA_TOKEN');
    const url = await PMS_UTIL.getParameter('WHATSAPP_API_URL');
    const templateName = await PMS_UTIL.getParameter('WA_UAE_PAYMENT_CONFIRMATION_TO_USER_TEMPLATE_ID');
    console.log("token ===>", token?.Parameter?.Value);
    console.log("url ===>", url?.Parameter?.Value);

    const ACCESS_TOKEN = token?.Parameter?.Value;
    const WHATSAPP_API_URL = url?.Parameter?.Value;
    const TEMPLATE_ID = templateName?.Parameter?.Value;

    try {
        const payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
                name: TEMPLATE_ID,
                language: {
                    code: 'en_US',
                },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            {
                                type: 'text',
                                text: patientName // Patient's name
                            },
                            {
                                type: 'text',
                                text: `${currency} ${amount}` // Payment amount with currency
                            },
                            {
                                type: 'text',
                                text: programName // Program name
                            },
                            {
                                type: 'text',
                                text: date // Date
                            }
                        ]
                    }
                ]
            }
        };

        const response = await axios.post(WHATSAPP_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('WhatsApp message sent:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        throw error;
    }
};
