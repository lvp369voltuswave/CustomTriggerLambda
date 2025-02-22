const { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({ region: "ap-south-1" });

exports.resendOtp = async (event) => {
    // Handle CORS preflight request
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Replace '*' with allowed origin if needed
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        body: "",
      };
    }
  try {
    const body = JSON.parse(event.body); // Parse event body
    const { username} = body;
    const input = {
      ClientId: "528oo9ok69b2kg38en84d1qtel",
      Username: username,
    };

    const command = new ResendConfirmationCodeCommand(input);
    const response = await client.send(command);

    console.log("Resend OTP Response:", response);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify({
        message: "OTP resent successfully",
        response, // Cognito response (delivery medium: email or SMS)
      }),
    };
  } catch (error) {
    console.error("Error resending OTP:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify({
        message: "Failed to resend OTP",
        error: error.message,
      }),
    };
  }
};
