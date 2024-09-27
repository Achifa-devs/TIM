import requests

# Define API endpoint and parameters
url = 'https://app.smartsmssolutions.com/io/api/client/v1/sms/'
params = {
    'token': 'eux10nDJqBMMNAltgNOpnYF7RV47NSP2tS5qZcnJI2UqB7Nb8B',
    'sender': 'Timsecurity',
    'to': '0805907551',
    'message': 'Testing sms Api',
    'type': '0',
    'routing': '2'
}
try:
        response = requests.post(url, data=params)
        v= response.raise_for_status()  # Raise an exception for non-200 status codes

        print("SMS alert sent successfully!", v)
except requests.exceptions.RequestException as error:
        print(f"Error sending SMS alert: {error}")

