const { CognitoIdentityProviderClient, SignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");

exports.lambdaHandler = async (event) => {
    try {
        const body = JSON.parse(event.body); // Parse event body

        const { email, firstName, lastName, phoneNumber, userName, password } = body;

        // Validate required parameters
        if (!email || !firstName || !lastName || !phoneNumber || !userName || !password) {
            throw new Error("Missing required parameters: email, firstName, lastName, phoneNumber, userName, or password");
        }

        const client = new CognitoIdentityProviderClient({});
        
        const command = new SignUpCommand({
            ClientId: "528oo9ok69b2kg38en84d1qtel",
            Username: userName,
            Password: password,
            UserAttributes: [
                { Name: "email", Value: email },
                { Name: "phone_number", Value: phoneNumber },
                { Name: "given_name", Value: firstName },
                { Name: "family_name", Value: lastName },
                { Name: "custom:Password", Value: password },
                { Name: "custom:isPasswordChanged", Value: "false" }
            ]
        });


        const response = await client.send(command);
        console.log("SignUp successful:", response);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User signed up successfully!", response }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
    } catch (error) {
        console.error("Error during SignUp:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "SignUp failed", error: error.message }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // Allow all origins, or restrict it to a specific domain
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        };
    }
};


// const { CognitoIdentityProviderClient, SignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");

// exports.lambdaHandler = async (event) => {
//     try {
//         const signUp = async () => {
//             const client = new CognitoIdentityProviderClient({});
            
//             const command = new SignUpCommand({
//                 ClientId: "528oo9ok69b2kg38en84d1qtel",
//                 Username: "Maneesh_123",
//                 Password: "Apple#123",
//                 UserAttributes: [
//                     { Name: "email", Value: "vara.prasad.thaduka.voltus@amura.ai" },
//                     { Name: "phone_number", Value: "+919896332965" },
//                     { Name: "given_name", Value: "Maneesh" },
//                     { Name: "family_name", Value: "Kumar" },
//                     { Name: "custom:Password", Value: "Apple#123" },
//                     { Name: "custom:isPasswordChanged", Value: 'false'}
//                 ],
//             });

//             return await client.send(command);
//         };

//         const response = await signUp();
//         console.log("SignUp successful:", response);

//         return {
//             statusCode: 200,
//             body: JSON.stringify({ message: "User signed up successfully!", response }),
//         };
//     } catch (error) {
//         console.error("Error during SignUp:", error);

//         return {
//             statusCode: 500,
//             body: JSON.stringify({ message: "SignUp failed", error: error.message }),
//         };
//     }
// };
