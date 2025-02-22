const {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GetUserAttributeVerificationCodeCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

exports.lambdaHandler = async (event) => {
  const config = { region: "ap-south-1" };
  const client = new CognitoIdentityProviderClient(config);

  try {
      const { username, confirmationCode, password } = JSON.parse(event.body);
      console.log(JSON.parse(event.body));
      console.log('response==>', {username, confirmationCode, password});
      if (!username || !confirmationCode || !password) {
          throw new Error("Missing required parameters: username, confirmationCode, or password.");
      }

      const ClientId = "528oo9ok69b2kg38en84d1qtel";

      // Step 1: Confirm User Signup
      const confirmSignUpCommand = new ConfirmSignUpCommand({
          ClientId,
          Username: username,
          ConfirmationCode: `${confirmationCode}`,
      });
      const confirmSignUpResponse = await client.send(confirmSignUpCommand);
      console.log('confirmSignUpResponse', confirmSignUpResponse)
      console.log(`User ${username} confirmed successfully.`);

      // Step 2: Authenticate User
      const initiateAuthCommand = new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: {
              USERNAME: username,
              PASSWORD: password,
          },
          ClientId,
      });

      const authResponse = await client.send(initiateAuthCommand);
      console.log("Authentication successful.");

      const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;

      // Step 3: Request Email Verification Code
      const getVerificationCodeCommand = new GetUserAttributeVerificationCodeCommand({
          AccessToken,
          AttributeName: "email",
      });

      const verificationResponse = await client.send(getVerificationCodeCommand);
      console.log("Email verification code sent.");

      return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          },
          body: JSON.stringify({
              message: "User authenticated, email verification initiated.",
              tokens: {
                  idToken: IdToken,
                  accessToken: AccessToken,
                  refreshToken: RefreshToken,
              },
              confirmSignUpResponse,
              verificationResponse,
          }),
      };
  } catch (error) {
      console.error("Error processing request:", error);

      return {
          statusCode: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          },  
          body: JSON.stringify({
              message: "An error occurred",
              error: error.message,
          }),
      };
  }
};
