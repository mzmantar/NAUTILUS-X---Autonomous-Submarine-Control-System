#include "Commands.hpp"

#include <Arduino.h>
#include "SIO.hpp"
#include "Motors.hpp"
#include "RGBLight.hpp"
#include "Relays.hpp"
#include "Accelerometer.hpp"
#include "SensorHook.hpp"

namespace Commands {
    // isready
    void isready() {
        SIO::send("received", "isready");
        if (isready) {
            SIO::raw("readyok");
        } else {
            SIO::raw("notready");
        }
        SIO::cleanCommand();
    }

    // sensors <get | start | stop> <sensor*>
    //    *sensor: all | acc | gyro | temp | mtu | volt | tf
    //    (i) all = acc + gyro + temp + volt + tf
    //    (i) mtu = acc + gyro + temp
    //    (i) pos = acc + gyro + tf
    void sensors() {
        SIO::send("received", "sensors");
        String arg1 = SIO::nextArgument();
        String arg2 = SIO::nextArgument();
        uint8_t sensors = 0;

        if (arg2 == "all") {
            sensors = Sensors::ALL;
        } else if (arg2 == "mtu") {
            sensors = Sensors::MTU;
        } else if (arg2 == "pos") {
            sensors = Sensors::ACC | Sensors::GYRO | Sensors::TF;
        } else if (arg2 == "volt") {
            sensors = Sensors::VOLT;
        } else if (arg2 == "tf") {
            sensors = Sensors::TF;
        } else if (arg2 == "temp") {
            sensors = Sensors::TEMP;
        } else if (arg2 == "acc") {
            sensors = Sensors::ACC;
        } else if (arg2 == "gyro") {
            sensors = Sensors::GYRO;
        } else {
            SIO::log("Capteur '" + arg2 + "' invalide. Voir le manuel.");
            SIO::send("error", "invalid_command");
            SIO::cleanCommand();
            return;
        }

        if (arg1 == "get") {
            Sensors::sendValuesToSIO(sensors);
        } else if (arg1 == "start") {
            Sensors::echoSensors(sensors, true);
        } else if (arg1 == "stop") {
            Sensors::echoSensors(sensors, false);
        } else {
            SIO::log("Commande 'sensors' invalide. Voir le manuel.");
            SIO::send("error", "invalid_command");
        }
        SIO::cleanCommand();
    }

    // rgblight <brightness | color | on | off> [...]
    // rgblight brightness <get | set> [...]
    // rgblight brightness get
    // rgblight brightness set <0 à 255>
    // rgblight color <get | set> [...]
    // rgblight color get
    // rgblight color set <r: 0 à 255> <g: 0 à 255> <b: 0 à 255>
    // rgblight color pixel <pixelNum: 0 à 24> <r: 0 à 255> <g: 0 à 255> <b: 0 à 255>
    // rgblight color range <fromPixel: 0 à 24> <toPixel: 0 à 24> <r: 0 à 255> <g: 0 à 255> <b: 0 à 255>
    // rgblight on
    // rgblight off
    void rgblight() {
        SIO::send("received", "rgblight");
        String arg1 = SIO::nextArgument();

        if (arg1 == "brightness") {
            String arg2 = SIO::nextArgument();
            if (arg2 == "get") {
                SIO::send("rgblight", "brightness " + String(RGBLight::BRIGHTNESS));
            } else if (arg2 == "set") {
                String arg3 = SIO::nextArgument();
                uint8_t brightness = arg3.toInt();
                RGBLight::setBrightness(brightness);
            } else {
                SIO::log("Commande 'rgblight brightness' invalide. Voir le manuel.");
                SIO::send("error", "invalid_command");
            }
        } else if (arg1 == "color") {
            String arg2 = SIO::nextArgument();
            if (arg2 == "get") {
                SIO::send("rgblight", "color " + String(RGBLight::getR()) + " " + String(RGBLight::getG()) + " " + String(RGBLight::getB()));
            } else if (arg2 == "set") {
                String r = SIO::nextArgument();
                String g = SIO::nextArgument();
                String b = SIO::nextArgument();
                RGBLight::setColor((uint8_t) r.toInt(), (uint8_t) g.toInt(), (uint8_t) b.toInt());
            } else if (arg2 == "pixel") {
                String pn = SIO::nextArgument();
                String r = SIO::nextArgument();
                String g = SIO::nextArgument();
                String b = SIO::nextArgument();
                RGBLight::setLedColor((uint16_t) pn.toInt(), (uint8_t) r.toInt(), (uint8_t) g.toInt(), (uint8_t) b.toInt());
            } else if (arg2 == "range") {
                String ps = SIO::nextArgument();
                String pe = SIO::nextArgument();
                String r = SIO::nextArgument();
                String g = SIO::nextArgument();
                String b = SIO::nextArgument();
                RGBLight::setRangeColor((uint16_t) ps.toInt(), (uint16_t) pe.toInt(), (uint8_t) r.toInt(), (uint8_t) g.toInt(), (uint8_t) b.toInt());
            } else {
                SIO::log("Commande 'rgblight color' invalide. Voir le manuel.");
                SIO::send("error", "invalid_command");
            }
        } else if (arg1 == "on") {
            RGBLight::turnOn();
        } else if (arg1 == "off") {
            RGBLight::turnOff();
        } else {
            SIO::log("Commande 'rgblight' invalide. Voir le manuel.");
            SIO::send("error", "invalid_command");
        }
        SIO::cleanCommand();
    }

    // relay <1-4 | all> <set | get | toggle> [...]
    // relay <1-4 | all> set <on | off>
    // relay <1-4 | all> get
    // relay <1-4 | all> toggle
    void relay() {
        SIO::send("received", "relay");
        String arg1 = SIO::nextArgument();
        String arg2 = SIO::nextArgument();

        if(arg2 == "set") {
            String arg3 = SIO::nextArgument();
            if(arg3 != "on" && arg3 != "off") {
                SIO::log("Commande 'relay set' invalide. Voir le manuel.");
                SIO::send("error", "invalid_command");
                return;
            }
            bool state = (arg3 == "on");
            if (arg1 == "all") {
                for(uint8_t i = 1; i <= Relays::NB_RELAYS; i++) {
                    if(Relays::relaysInstalled[i-1] && !Relays::relaysInternal[i-1]) {
                        Relays::setRelayState(i, state);
                    }/* else {
                        SIO::log("Relais " + String(i) + " non installé, état ignoré.");
                    }*/
                }
            } else {
                uint8_t relayId = arg1.toInt();
                if (relayId >= 1 && relayId <= Relays::NB_RELAYS && !Relays::relaysInternal[relayId-1]) {
                    Relays::setRelayState(relayId, state);
                }/* else { && !Relays::relaysInternal[i-1]
                    SIO::log("Relais " + String(relayId) + " invalide.");
                    SIO::send("error", "invalid_relay");
                }*/
            }
        } else if(arg2 == "get") {
            if (arg1 == "all") {
                for(uint8_t i = 1; i <= Relays::NB_RELAYS; i++) {
                    if(Relays::relaysInstalled[i-1]) {
                        bool state = Relays::getRelayState(i);
                        SIO::send("relay", String(i) + " " + (state ? "on" : "off"));
                    }/* else {
                        SIO::log("Relais " + String(i) + " non installé, état ignoré.");
                    }*/
                }
            } else {
                uint8_t relayId = arg1.toInt();
                if (relayId >= 1 && relayId <= Relays::NB_RELAYS) {
                    bool state = Relays::getRelayState(relayId);
                    SIO::send("relay", String(relayId) + " " + (state ? "on" : "off"));
                }/* else {
                    SIO::log("Relais " + String(relayId) + " invalide.");
                    SIO::send("error", "invalid_relay");
                }*/
            }
        } else if(arg2 == "toggle") {
            if (arg1 == "all") {
                for(uint8_t i = 1; i <= Relays::NB_RELAYS; i++) {
                    if(Relays::relaysInstalled[i-1] && !Relays::relaysInternal[i-1]) {
                        Relays::toggleRelay(i);
                    }/* else {
                        SIO::log("Relais " + String(i) + " non installé, état ignoré.");
                    }*/
                }
            } else {
                uint8_t relayId = arg1.toInt();
                if (relayId >= 1 && relayId <= Relays::NB_RELAYS && !Relays::relaysInternal[relayId-1]) {
                    Relays::toggleRelay(relayId);
                }/* else {
                    SIO::log("Relais " + String(relayId) + " invalide.");
                    SIO::send("error", "invalid_relay");
                }*/
            }
        } else {
            SIO::log("Commande 'relay' invalide. Voir le manuel.");
            SIO::send("error", "invalid_command");
        }
        SIO::cleanCommand();
    }

    // motor <motorId | all> <speed | stop | calibrate> [...]
    // motor <motorId | all> speed <get | set> [...]
    // motor <motorId | all> speed get
    // motor <motorId | all> speed set <value>
    // motor <motorId | all> stop
    // motor <motorId | all> calibrate [progressive | brutal]
    void motor() {
        SIO::send("received", "motor");
        String arg1 = SIO::nextArgument();
        String arg2 = SIO::nextArgument();

        if (arg2 == "raw") {
            String arg3 = SIO::nextArgument();
            if (arg1 == "all") {
                for(MotorId i = 1; i <= Motors::NB_MOTORS; i++) {
                    if (Motors::isValid(i)) {
                        Motors::sendRaw(i, arg3.toInt());
                    }
                }
            } else {
                MotorId motorId = arg1.toInt();
                if (Motors::needsValidity(motorId)) {
                    Motors::sendRaw(motorId, arg3.toInt());
                }
            }
        } else if (arg2 == "speed") {
            String arg3 = SIO::nextArgument();
            if (arg3 == "get") {
                if (arg1 == "all") {
                    for(MotorId i = 1; i <= Motors::NB_MOTORS; i++) {
                        if (Motors::isValid(i)) {
                            MotorSpeed speed = Motors::getMotorSpeed(i);
                            SIO::send("motor", String(i) + " speed " + String(speed));
                        }
                    }
                } else {
                    MotorId motorId = arg1.toInt();
                    if (Motors::needsValidity(motorId)) {
                        MotorSpeed speed = Motors::getMotorSpeed(motorId);
                        SIO::send("motor", String(motorId) + " speed " + String(speed));
                    }
                }
            } else if (arg3 == "set") {
                String arg4 = SIO::nextArgument();
                MotorSpeed speed = arg4.toInt();
                if (arg1 == "all") {
                    Motors::setAllMotorsSpeed(speed, true);
                } else {
                    MotorId motorId = arg1.toInt();
                    if (Motors::needsValidity(motorId)) Motors::setMotorSpeed(motorId, speed, true);
                }
            }
        } else if (arg2 == "stop") {
            if (arg1 == "all") {
                Motors::stopAllMotors();
            } else {
                MotorId motorId = arg1.toInt();
                if (Motors::needsValidity(motorId)) Motors::stopMotor(motorId);
            }
        } else if (arg2 == "reset") {
            if (arg1 == "all") {
                Motors::resetAllMotors();
            } else {
                MotorId motorId = arg1.toInt();
                if (Motors::needsValidity(motorId)) Motors::resetMotor(motorId);
            }
        } else if (arg2 == "calibrate") {
            if (arg1 == "all") {
                Motors::calibrateAllMotors();
            } else {
                MotorId motorId = arg1.toInt();
                if (Motors::needsValidity(motorId)) Motors::calibrateMotor(motorId);
            }
        } else {
            SIO::log("Commande 'motor' invalide. Voir le manuel.");
            SIO::send("error", "invalid_command");
        }
        SIO::cleanCommand();
    }
};