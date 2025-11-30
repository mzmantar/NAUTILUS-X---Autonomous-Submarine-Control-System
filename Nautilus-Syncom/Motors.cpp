#include "Motors.hpp"
#include <Arduino.h>
#include "SIO.hpp"
#include "Relays.hpp"

/*
#ifndef ledcSetup
#define ledcSetup(channel, freq, resolution) SIO::log("!!! ledcSetup invalide ici")
#endif
#ifndef ledcAttachPin
#define ledcAttachPin(pin, channel) SIO::log("!!! ledcAttachPin invalide ici")
#endif
#ifndef ledcWrite
#define ledcWrite(channel, duty) SIO::log("!!! ledcWrite invalide ici")
#endif
*/

typedef uint8_t MotorId;
typedef uint8_t GPIOPin;
typedef int8_t MotorSpeed;

#define SPEED_MAGNITUDE 100

namespace Motors {
    
    const int PWM_FREQUENCY = 50;
    const int PWM_RESOLUTION = 16;
    const double PWM_PERIOD = 1000000.0 / PWM_FREQUENCY;

    const uint8_t NB_MOTORS = 16;
    MotorSpeed motorsSpeed[NB_MOTORS];
    bool motorsCalibrated[NB_MOTORS];
    bool motorsInstalled[NB_MOTORS];
    bool motorsDirection[NB_MOTORS];
    int8_t motorsRelayId[NB_MOTORS];

    void initialize() {
        for (uint8_t i = 0; i < NB_MOTORS; i++) {
            motorsSpeed[i] = 0;
            motorsCalibrated[i] = false;
            motorsInstalled[i] = false;
            motorsDirection[i] = true;
            motorsRelayId[i] = -1;
        }
    }

    void addMotor(MotorId motorId, GPIOPin gpioPin, bool inverted) {
        ledcSetup(motorId - 1, PWM_FREQUENCY, PWM_RESOLUTION);
        ledcAttachPin(gpioPin, motorId - 1);
        SIO::log("Moteur " + String(motorId) + " ajouté ["+String(gpioPin)+"@"+String(PWM_FREQUENCY)+"Hz/"+String(PWM_RESOLUTION)+"]");
        motorsInstalled[motorId - 1] = true;
        motorsDirection[motorId - 1] = !inverted;
    }

    void connectMotor(MotorId motorId) {
        if (!isValid(motorId)) {
            SIO::log("Erreur: ID de moteur invalide pour la connexion.");
            return;
        }
        if (motorsRelayId[motorId - 1] == -1) {
            SIO::log("Erreur: Le moteur " + String(motorId) + " n'a pas de relais associé.");
            return;
        }
        sendRaw(motorId, 1000);
        SIO::log("Moteur " + String(motorId) + " connecté");
    }

    void disconnectMotor(MotorId motorId) {
        if (!isValid(motorId)) {
            SIO::log("Erreur: ID de moteur invalide pour la connexion.");
            return;
        }
        if (motorsRelayId[motorId - 1] == -1) {
            SIO::log("Erreur: Le moteur " + String(motorId) + " n'a pas de relais associé.");
            return;
        }
        SIO::log("Moteur " + String(motorId) + " déconnecté");
    }

    bool isConnected(MotorId motorId) {
        if (!isValid(motorId)) {
            SIO::log("Erreur: ID de moteur invalide pour la vérification de connexion.");
            return false;
        }
        if (motorsRelayId[motorId - 1] == -1) {
            return true;
        }
        bool state = Relays::getRelayState(motorsRelayId[motorId - 1]);
        return state;
    }

    void calibrateMotor(MotorId motorId, bool progressive) {
        if (progressive) {
            SIO::log("Calibration progressive du moteur " + String(motorId) + " ... eta 27 s");
            SIO::send("motor", String(motorId) + " calibration started");
            if(!motorsCalibrated[motorId - 1]) {
                sendRaw(motorId, 1000);
            } else {
                setMotorSpeed(motorId, 0, false);
            }
            delay(2000);
            setMotorSpeed(motorId, 0, false);
            delay(1000);
            for (int i = 0; i <= SPEED_MAGNITUDE; i += 1) {
                setMotorSpeed(motorId, i, false);
                delay(100);
            }
            delay(3000);
            for (int i = SPEED_MAGNITUDE; i >= 0; i -= 1) {
                setMotorSpeed(motorId, i, false);
                delay(100);
            }
            delay(3000);
            for (int i = 0; i <= SPEED_MAGNITUDE; i += 1) {
                setMotorSpeed(motorId, -i, false);
                delay(100);
            }
            delay(3000);
            for (int i = SPEED_MAGNITUDE; i >= 0; i -= 1) {
                setMotorSpeed(motorId, -i, false);
                delay(100);
            }
            delay(1000);
            SIO::send("motor", String(motorId) + " calibration ok");
            motorsCalibrated[motorId - 1] = true;
        } else {
            SIO::log("Calibration brutale (déconseillé) du moteur " + String(motorId) + " ... eta 12 s");
            SIO::send("motor", String(motorId) + " calibration started");
            sendRaw(1, 1000);
            delay(2000);
            setMotorSpeed(motorId, 0, false);
            delay(1000);
            setMotorSpeed(motorId, SPEED_MAGNITUDE, false);
            delay(3000);
            setMotorSpeed(motorId, 0, false);
            delay(2000);
            setMotorSpeed(motorId, -SPEED_MAGNITUDE, false);
            delay(3000);
            setMotorSpeed(motorId, 0, false);
            delay(1000);
            SIO::send("motor", String(motorId) + " calibration ok");
            motorsCalibrated[motorId - 1] = true;
        }
    }
    void calibrateAllMotors(bool progressive) {
        for (MotorId i = 1; i <= NB_MOTORS; i++) {
            if (motorsInstalled[i-1]) {
                calibrateMotor(i, progressive);
            } /* else {
                SIO::log("Moteur " + String(i) + " non installé, calibration ignorée.");
            } */
        }
    }

    MotorSpeed getMotorSpeed(MotorId motorId) {
        return motorsSpeed[motorId - 1];
    }
    void setAllMotorsSpeed(MotorSpeed speed, bool soft = true) {
        for(MotorId i = 1; i <= NB_MOTORS; i++) if (motorsInstalled[i-1]) connectMotor(i);

        int oldSpeed[NB_MOTORS], nm, multiplier[NB_MOTORS];
        bool inverted[NB_MOTORS], dir[NB_MOTORS];
        for(MotorId i = 1; i <= NB_MOTORS; i++) if (motorsInstalled[i-1]) oldSpeed[i-1] = motorsSpeed[i - 1];
        for(MotorId i = 1; i <= NB_MOTORS; i++) if (motorsInstalled[i-1]) inverted[i-1] = !motorsDirection[i - 1];

        if (soft) {
            for(MotorId i = 1; i <= NB_MOTORS; i++) if (motorsInstalled[i-1]) dir[i-1] = (speed >= oldSpeed[i]);
            for(MotorId i = 1; i <= NB_MOTORS; i++) if (motorsInstalled[i-1]) multiplier[i-1] = dir[i-1] ? 1 : -1;
            //for(int step = 0; dir ? (oldSpeed + step < speed) : (oldSpeed + step > speed); step += multiplier * SPEED_MAGNITUDE / 10) {
            bool end = false;
            for(int steps = 0; !end; steps++) {
                end = true;
                for(MotorId i = 1; i <= NB_MOTORS; i++) if (motorsInstalled[i-1]) {
                    int step = steps * multiplier[i-1] * SPEED_MAGNITUDE / 10;
                    if (dir ? (oldSpeed[i-1] + step < speed) : (oldSpeed[i-1] + step > speed)) {
                        end = false;
                        nm = map(oldSpeed[i-1] + step, -SPEED_MAGNITUDE, SPEED_MAGNITUDE, inverted[i-1] ? 1700 : 1300, inverted[i-1] ? 1300 : 1700);
                        sendRaw(i, nm);
                        motorsSpeed[i - 1] = oldSpeed[i-1] + step;
                    }
                }
                delay(250);
            }
        }

        for(MotorId i = 1; i <= NB_MOTORS; i++) if (motorsInstalled[i-1]) {
            sendRaw(i, map(speed, -SPEED_MAGNITUDE, SPEED_MAGNITUDE, inverted[i-1] ? 1700 : 1300, inverted[i-1] ? 1300 : 1700));
            motorsSpeed[i - 1] = speed;
        }
    }

    void setMotorSpeed(MotorId motorId, MotorSpeed speed, bool soft = true) {
        connectMotor(motorId);

        int oldSpeed = motorsSpeed[motorId - 1];
        int nm;
        bool inverted = !motorsDirection[motorId - 1];
        if (soft) {
            bool dir = (speed >= oldSpeed);
            int multiplier = dir ? 1 : -1;
            for(int step = 0; dir ? (oldSpeed + step < speed) : (oldSpeed + step > speed); step += multiplier * SPEED_MAGNITUDE / 10) {
                nm = map(oldSpeed + step, -SPEED_MAGNITUDE, SPEED_MAGNITUDE, inverted ? 1700 : 1300, inverted ? 1300 : 1700);
                sendRaw(motorId, nm);
                motorsSpeed[motorId - 1] = oldSpeed + step;
                delay(250);
            }
        }
        nm = map(speed, -SPEED_MAGNITUDE, SPEED_MAGNITUDE, inverted ? 1700 : 1300, inverted ? 1300 : 1700);
        sendRaw(motorId, nm);
        motorsSpeed[motorId - 1] = speed;
    }

    void sendRaw(MotorId motorId, int nm) {
        uint32_t duty = (nm / PWM_PERIOD) * 65535;
        SIO::log("Moteur " + String(motorId) + " > µs = " + nm);
        ledcWrite(motorId - 1, duty);
        delayMicroseconds(PWM_PERIOD);
    }
    
    /*void setAllMotorsSpeed(MotorSpeed speed, bool soft = true) {
        /*for (MotorId i = 1; i <= NB_MOTORS; i++) {
            if (motorsInstalled[i-1]) {
                setMotorSpeed(i, speed);
            } /* else {
                SIO::log("Moteur " + String(i) + " non installé, vitesse ignorée.");
            } 
        }*//*
        int oldSpeeds[NB_MOTORS] = {};
        for(int i = 0; i < NB_MOTORS; i++) oldSpeeds[i] = motorsSpeed[i];

        int nm;
        if (soft) {
            for(int step = 0; step < SPEED_MAGNITUDE; step++) {
                for(MotorId i = 1; i <= NB_MOTORS; i++) {
                    if (motorsInstalled[i-1]) {
                        double interval = (speed - oldSpeeds[i-1]) / 10.0;
                        int newSpeed = oldSpeeds[i-1] + step * interval;
                        setMotorSpeed(i, newSpeed, false);
                    } /* else {
                        SIO::log("Moteur " + String(i) + " non installé, vitesse ignorée.");
                    } *//*
                }
                delay(250);
            }
        }
        for(MotorId i = 1; i <= NB_MOTORS; i++) {
            if (motorsInstalled[i-1]) {
                setMotorSpeed(i, speed, false);
            } /* else {
                SIO::log("Moteur " + String(i) + " non installé, vitesse ignorée.");
            } *//*
        }
    }*/

    void stopMotor(MotorId motorId) {
        setMotorSpeed(motorId, 0, false);
    }
    void stopAllMotors() {
        setAllMotorsSpeed(0);
    }

    void resetMotor(MotorId motorId) {
        disconnectMotor(motorId);
        delay(500);
        sendRaw(motorId, 1000);
        delay(500);
        connectMotor(motorId);
        delay(500);
        motorsSpeed[motorId - 1] = 0;
        motorsCalibrated[motorId - 1] = false;
        SIO::log("Moteur " + String(motorId) + " réinitialisé.");
        SIO::send("motor", String(motorId) + " reset");
    }
    void resetAllMotors() {
        for (MotorId i = 1; i <= NB_MOTORS; i++) {
            if (motorsInstalled[i-1]) {
                resetMotor(i);
            } /* else {
                SIO::log("Moteur " + String(i) + " non installé, réinitialisation ignorée.");
            } */
        }
    }

    bool isValid(MotorId motorId) {
        return (motorId >= 1 && motorId <= NB_MOTORS && motorsInstalled[motorId - 1]);
    }

    bool needsValidity(MotorId motorId) {
        bool valid = isValid(motorId);
        if (!valid) {
            SIO::log("Moteur " + String(motorId) + " non valide.");
        }
        return valid;
    }
};