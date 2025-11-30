#include "SIO.hpp"
#include "SensorHook.hpp"
#include "SensorTF.hpp"
#include "SensorVoltage.hpp"
#include "SensorMTU.hpp"

typedef uint8_t GPIOPin;

namespace Sensors
{
    const uint8_t VOLT = 1;
    const uint8_t TF = 2;
    const uint8_t TEMP = 4;
    const uint8_t ACC = 8;
    const uint8_t GYRO = 16;
    const uint8_t MTU = TEMP | ACC | GYRO;
    const uint8_t ALL  = MTU | VOLT | TF;

    uint8_t sensorsEchoing = 0;

    void initializeSensors()
    {
        SIO::log("Initialisation des capteurs...");
        SensorTF::initialize(115200, SERIAL_8N1, 16, 17); // RX, TX
        SIO::log(".. TFmini initialisé [RX@16 TX@17]");
        SensorVoltage::initialize(12);
        SIO::log(".. Capteur de tension initialisé [PIN@12]");
        //SensorMTU::initialize(21, 22);
        //SIO::log(".. MTU-92.65 initialisé [SDA@21 SCL@22]");
        SIO::log("Capteurs initialisés");
    }

    void sendValuesToSIO(uint8_t sensors)
    {
        if(sensors & VOLT) {
            SensorVoltage::updateValues();
            SIO::send("sensor volt", String(SensorVoltage::getVoltage(), 2));
        }
        if(sensors & TF) {
            SensorTF::updateValues(5, false);
            SIO::send("sensor tf", String(SensorTF::getDistance()));
        }
        if(sensors & (TEMP | ACC | GYRO)) {
            SensorMTU::updateValues();
        }
        if(sensors & TEMP) SIO::send("sensor temp", String(SensorMTU::getTemp(), 2));
        if(sensors & ACC ) SIO::send("sensor acc",  String(SensorMTU::getAccX()) + " " + String(SensorMTU::getAccY()) + " " + String(SensorMTU::getAccZ()));
        if(sensors & GYRO) SIO::send("sensor gyro",  String(SensorMTU::getGyroX()) + " " + String(SensorMTU::getGyroY()) + " " + String(SensorMTU::getGyroZ()));
    }
    void echoSensors(uint8_t sensors, bool state) {
        for(int i = 0; i < 5; i++) {
            uint8_t j = 1 << i;
            if(sensors & j) {
                if(state) sensorsEchoing |= j;
                else      sensorsEchoing &= ~j;
            }
        }
    }
    void tick() {
        sendValuesToSIO(sensorsEchoing);
    }
};
