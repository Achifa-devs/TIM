import requests, os

def send_sms_alert(class_name, phone_number):
    api_url = "https://app.smartsmssolutions.com/io/api/client/v1/sms/"

    message = f"Suspicious activity detected at ifite gate: {class_name}"

    token = os.environ.get("SMARTSMS_TOKEN")
    print(token)
    params = {
        "token": token,
        "sender": "Timsecurity",
        "to": phone_number,
        "message": message,
        "type": 0,  # Plain Text message (default)
        "routing": "2",
    }

    response = requests.post(api_url, data=params)

    if response.status_code == 200:
        from app import Alert, Personnel
        
        personnel = Personnel.query.filter(phone_number=phone_number).first()
        Alert(message=message, personnel_id=personnel.id).create()
        print("SMS alert sent successfully!")
    else:
        print(f"Error sending SMS alert: {response.text}")
