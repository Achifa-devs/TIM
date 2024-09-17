import requests

def send_sms_alert(class_name):
    api_url = "https://app.smartsmssolutions.com/io/api/client/v1/sms/"

    message = f"Suspicious activity detected at ifite gate: {class_name}"

    params = {
        "token": "eux10nDJqBMMNAltgNOpnYF7RV47NSP2tS5qZcnJI2UqB7Nb8B4",
        "sender": "Timsecurity",
        "to": "08059075519",
        "message": message,
        "type": 0,  # Plain Text message (default)
        "routing": "2",
    }

    response = requests.post(api_url, data=params)

    if response.status_code == 200:
        print("SMS alert sent successfully!")
    else:
        print(f"Error sending SMS alert: {response.text}")
