const {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  UpdateUserAttributesCommand,
  GetUserAttributeVerificationCodeCommand,
  VerifyUserAttributeCommand,
  GetUserCommand,
  ChangePasswordCommand
} = require("@aws-sdk/client-cognito-identity-provider");

exports.lambdaHandler = async (event) => {
  const config = { region: "ap-south-1" }; // Update your AWS region
  const client = new CognitoIdentityProviderClient(config);
  const clientId = "528oo9ok69b2kg38en84d1qtel";
  const body = JSON.parse(event.body); // Parse event body
  const { username, password, proposedPassword } = body;

  try {
      // Step 2: Initiate Authentication
      const initiateAuthInput = {
          AuthFlow: "USER_PASSWORD_AUTH", // Choose the appropriate AuthFlow
          AuthParameters: {
              USERNAME: username, // Username for authentication
              PASSWORD: password, // Password provided by the user
          },
          ClientId: clientId, // Use the same ClientId
      };

      const initiateAuthCommand = new InitiateAuthCommand(initiateAuthInput);
      const authResponse = await client.send(initiateAuthCommand);

      console.log("Authentication successful:", JSON.stringify(authResponse, null, 2));

      // Extract authentication tokens
      const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;

      // Step 3: Get User Details
      const getUserInput = { // GetUserRequest
          AccessToken: AccessToken, // required
      };
      const getUserCommand = new GetUserCommand(getUserInput);
      const getUserDetailsResponse = await client.send(getUserCommand);
      console.log("getUserDetailsResponse successfully", JSON.stringify(getUserDetailsResponse, null, 2));

      // Find previous password
      const previousPassword = getUserDetailsResponse.UserAttributes.find(attr => attr.Name === "custom:Password").Value;

      // Step 4: Change Password
      const passwordInput = { // ChangePasswordRequest
          PreviousPassword: previousPassword,
          ProposedPassword: proposedPassword, // required
          AccessToken: AccessToken, // required
      };
      const passwordCommand = new ChangePasswordCommand(passwordInput);
      const passwordCommandResponse = await client.send(passwordCommand);
      console.log('Successfully changed password:', JSON.stringify(passwordCommandResponse));

      // Step 5: Update User Attributes if password change was successful
      if (passwordCommandResponse) {
          const updateUserAttributesInput = {
              AccessToken: AccessToken, // The access token is required to update attributes
              UserAttributes: [
                  { Name: "custom:isPasswordChanged", Value: "true" }
              ],
          };

          const updateAttributeCommand = new UpdateUserAttributesCommand(updateUserAttributesInput);
          const updateUserAttributesResponse = await client.send(updateAttributeCommand);

          return {
              statusCode: 200,
              headers: {
                  "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
                  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type, Authorization"
              },
              body: JSON.stringify({
                  message: "User authenticated and attributes updated successfully",
                  tokens: {
                      idToken: IdToken,
                      accessToken: AccessToken,
                      refreshToken: RefreshToken,
                  },
                  passwordCommandResponse,
                  updateUserAttributesResponse // Include the update response (e.g., email update)
              }),
          };
      }
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