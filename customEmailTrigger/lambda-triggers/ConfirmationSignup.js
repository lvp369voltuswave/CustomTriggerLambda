const {
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    UpdateUserAttributesCommand,
    GetUserAttributeVerificationCodeCommand
  } = require("@aws-sdk/client-cognito-identity-provider");
  
  exports.lambdaHandler = async (event) => {
    const config = { region: "ap-south-1" }; // Update your AWS region
    const client = new CognitoIdentityProviderClient(config);
  
    try {
        // step -1
        const confirmSignUpInput = {
            ClientId:  "528oo9ok69b2kg38en84d1qtel", // Use env variable for ClientId
            Username:  'Maneesh_123', // Username from the event
            ConfirmationCode: "438735", // Confirmation code from the event
          };
      
          const confirmSignUpCommand = new ConfirmSignUpCommand(confirmSignUpInput);
          const confirmResponse = await client.send(confirmSignUpCommand);
          console.log("User confirmed successfully:", JSON.stringify(confirmResponse, null, 2));
      
          // Step 2: Initiate Authentication
          const initiateAuthInput = {
            AuthFlow: "USER_PASSWORD_AUTH", // Choose the appropriate AuthFlow
            AuthParameters: {
              USERNAME: 'Maneesh_123', // Username for authentication
              PASSWORD: 'Apple#123', // Password provided by the user
            },
            ClientId: "528oo9ok69b2kg38en84d1qtel", // Use the same ClientId
          };
      
          const initiateAuthCommand = new InitiateAuthCommand(initiateAuthInput);
          const authResponse = await client.send(initiateAuthCommand);
      
          console.log("Authentication successful:", JSON.stringify(authResponse, null, 2));
      
          // Extract authentication tokens
          const { IdToken, AccessToken, RefreshToken } = authResponse.AuthenticationResult;
      
          // Step 3: Update User Attributes (e.g., email)
        //   const updateUserAttributesInput = {
        //     AccessToken: AccessToken, // The access token is required to update attributes
        //     UserAttributes: [
        //       {
        //         Name: "email", // Update the email attribute
        //         Value: "vara.prasad.thaduka.voltus@amura.ai", // New email value from the event
        //       },
        //     ],
        //   };
      
          // Step 3: Get User Attribute Verification Code (e.g., for email)
            const getVerificationCodeInput = {
                AccessToken: AccessToken, // Access token from the event
                AttributeName: "email", // Attribute for which the verification code is requested
            };
        
            const getVerificationCodeCommand = new GetUserAttributeVerificationCodeCommand(getVerificationCodeInput);
            const verificationResponse = await client.send(getVerificationCodeCommand);
            console.log("Verification code sent:", JSON.stringify(verificationResponse, null, 2));
  
          
      
          // Return successful response with authentication tokens and update response
          return {
            statusCode: 200,
            body: JSON.stringify({
              message: "User authenticated and attributes updated successfully and intiated email verification and send otp to mobile",
              tokens: {
                idToken: IdToken,
                accessToken: AccessToken,
                refreshToken: RefreshToken,
              },
              verificationResponse, // Include the update response (e.g., email update)
            }),
          };
    } catch (error) {
      console.error("Error processing request:", error);
  
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "An error occurred",
          error: error.message,
        }),
      };
    }
  };
  


// const {
//   CognitoIdentityProviderClient,
//   ConfirmSignUpCommand,
// } = require("@aws-sdk/client-cognito-identity-provider");

// exports.lambdaHandler = async (event) => {
//   const config = { region: "ap-south-1" }; // Update the region as per your Cognito setup
//   const client = new CognitoIdentityProviderClient(config);

//   const input = {
//     ClientId: "528oo9ok69b2kg38en84d1qtel", // Your App Client ID
//     Username: "vara_369", // The username of the user to confirm
//     ConfirmationCode: "927635", // The code sent to the user's email/phone
//     ForceAliasCreation: false, // Optional: Default is false
//   };

//   try {
//     const command = new ConfirmSignUpCommand(input);
//     const response = await client.send(command);
//     console.log("User confirmed successfully:", response);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "User confirmed successfully", response }),
//     };
//   } catch (error) {
//     console.error("Error confirming user sign-up:", error);

//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: "Failed to confirm user sign-up", error: error.message }),
//     };
//   }
// };
