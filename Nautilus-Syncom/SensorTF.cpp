
#include <Arduino.h>
#include "SIO.hpp"
#include "SensorTF.hpp"
#include <HardwareSerial.h>

typedef uint8_t GPIOPin;

HardwareSerial TFSerial(2);

void clearBuffer(HardwareSerial serial)
{
    while (serial.available())
    {
        serial.read();
    }
}

namespace SensorTF
{
    int distance;
    bool signalStrength;
    HardwareSerial TFSerial(2);

    void initialize(long baudrate, uint32_t config, GPIOPin rxPin, GPIOPin txPin)
    {
        TFSerial.begin(baudrate, config, rxPin, txPin);
    };
    void updateValues(int samples, bool checksum)
    {
        while (TFSerial.available()) TFSerial.read();
        int sumSamples = 0;
        for (int i = 0; i < samples; i++)
        {
            while (TFSerial.available() < 9) continue;
            if (TFSerial.read() == 0x59 && TFSerial.read() == 0x59)
            {
                uint8_t data[7];
                TFSerial.readBytes(data, 7);

                int distance = data[1] << 8 | data[0];
                int strength = data[3] << 8 | data[2];
                uint8_t checksumVal = (0x59 + 0x59 + data[0] + data[1] + data[2] + data[3] + data[4] + data[5] + data[6]) & 0xFF;

                if (checksum && checksumVal == data[6] || !checksum)
                {
                    sumSamples += distance;
                }
            }
        }
        distance = sumSamples / samples;
    }
    int getDistance() {
        return distance;
    }
    bool getStrength() {
        return signalStrength;
    }
};