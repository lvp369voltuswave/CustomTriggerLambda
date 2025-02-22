import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: "your-region" });

export const resendOtp = async (username) => {
  try {
    const input = {
      ClientId: "528oo9ok69b2kg38en84d1qtel",
      Username: username,
    };

    const command = new ResendConfirmationCodeCommand(input);
    const response = await client.send(command);

    console.log("Resend OTP Response:", response);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "OTP resent successfully",
        response, // Cognito response (delivery medium: email or SMS)
      }),
    };
  } catch (error) {
    console.error("Error resending OTP:", error);

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Failed to resend OTP",
        error: error.message,
      }),
    };
  }
};
