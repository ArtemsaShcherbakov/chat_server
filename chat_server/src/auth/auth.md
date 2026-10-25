FEATURE: User Login

OVERVIEW:
Allow registered users to authenticate securely using their name user and password.

ACCEPTANCE CRITERIA:

1. The login form must accept an user name and password
2. If credentials are valid, redirect the user to the dashboard
3. If credentials are invalid, display a generic error message
4. Lock the account for 15 minutes after 5 consecutive failed  
   login attempts
5. Transmit passwords over HTTPS only — never store in plain text
6. Validation for user name and password. User name was

Entities that should be in the module:

1. Tokens

Entities that should be in the shared entities:

1. Users
