import requests, os


def send_detection_alert(class_name, phone_number, personnel_id):

    url = "https://app.smartsmssolutions.com/io/api/client/v1/sms/"
    message = f"Suspicious activity detected at ifite gate: {class_name}"
    token = os.getenv("SMARTSMS_TOKEN")
    print(token)
    params = {
        "token": token,
        "sender": "Timsecurity",
        "to": phone_number,
        "message": message,
        "type": 0,  # Plain Text message (default)
        "routing": "2",
    }
    response = requests.post(url, data=params)

    if response.status_code == 200:
        from app import Alert
        # Alert(message=message, personnel_id=personnel_id).create()
        print("SMS alert sent successfully!")
    else:
        print("Error sending SMS alert: {response.text}")
