import serial
import time
import serial.tools.list_ports

def get_serial_port():
    ports = serial.tools.list_ports.comports()
    for port in ports:
        return port.device
    return None

def initialize_serial(port, baudrate=115200, timeout=5):
    return serial.Serial(port, baudrate, timeout=timeout)

def send_command(ser, command, delay=1):
    ser.write(command.encode())
    time.sleep(delay)
    return ser.read_all().decode(errors='ignore')

def get_gps_location():
    print("Récupération de la position GPS...")
    port = get_serial_port()
    if not port:
        print("Aucun port série détecté.")
        return None, None

    try:
        ser = initialize_serial(port)
        
        send_command(ser, 'AT+CGPSPWR=1\r')
        time.sleep(2)

        max_attempts = 20
        for attempt in range(max_attempts):
            gpsout_response = send_command(ser, 'AT+CGPSOUT=32\r')
            print(f"Tentative {attempt+1} - Réponse AT+CGPSOUT=32 :")
            print(gpsout_response.strip())

            lines = gpsout_response.strip().splitlines()
            for line in lines:
                if line.startswith("$GPRMC"):
                    fields = line.split(',')
                    if len(fields) > 2:
                        status = fields[2]
                        if status == 'A':  # GPS valide
                            latitude = fields[3] + " " + fields[4]
                            longitude = fields[5] + " " + fields[6]
                            print(f"Position GPS valide détectée : {latitude}, {longitude}")
                            ser.close()
                            return latitude, longitude
                        else:
                            print("Position GPS invalide (status V)")

            time.sleep(2)  # Attendre avant la prochaine tentative

        # En dernier recours, essaie avec AT+CGPSINF=0
        response = send_command(ser, 'AT+CGPSINF=0\r', delay=2)
        print(f"Réponse AT+CGPSINF=0 : {response.strip()}")
        if "+CGPSINF:" in response:
            parts = response.split(":")[1].split(",")
            latitude = parts[1].strip()
            longitude = parts[2].strip()
            if latitude != "0.000000" and longitude != "0.000000":
                print(f"Coordonnées GPS valides : latitude={latitude}, longitude={longitude}")
                ser.close()
                send_command(ser, 'AT+CFUN=1,1\r')

                return latitude, longitude

        ser.close()

    except Exception as e:
        print(f"Erreur : {e}")

    return None, None


