#include "Relays.hpp"
#include <Arduino.h>
#include "SIO.hpp"


namespace Relays {
    const uint8_t NB_RELAYS = 4;
    bool relaysInstalled[NB_RELAYS];
    bool relaysInternal[NB_RELAYS];
    bool relaysState[NB_RELAYS];
    GPIOPin relaysPins[NB_RELAYS];

    void initialize() {
        for (uint8_t i = 0; i < NB_RELAYS; i++) {
            relaysInstalled[i] = false;
            relaysInternal[i] = false;
            relaysState[i] = false;
            relaysPins[i] = 0;
        }
    }
    void addRelay(uint8_t relayId, GPIOPin gpioPin) {
        addRelay(relayId, gpioPin, false);
    }
    void addRelay(uint8_t relayId, GPIOPin gpioPin, bool internal) {
        pinMode(gpioPin, OUTPUT);
        digitalWrite(gpioPin, LOW);
        relaysInstalled[relayId - 1] = true;
        relaysPins[relayId - 1] = gpioPin;
        relaysState[relayId - 1] = false;
        relaysInternal[relayId - 1] = internal;
        SIO::log("Relais " + String(relayId) + " ajouté [@" + String(gpioPin) + "]" + (internal ? " (interne)" : ""));
    }
    void setRelayState(uint8_t relayId, bool state) {
        if(!relaysInstalled[relayId - 1]) {
            SIO::log("Relais " + String(relayId) + " non installé, état ignoré.");
            return;
        }
        digitalWrite(relaysPins[relayId - 1], !state ? LOW : HIGH);
        relaysState[relayId - 1] = state;
    }
    void setAllRelaysState(bool state) {
        for (uint8_t i = 0; i < NB_RELAYS; i++) {
            if (relaysInstalled[i]) {
                setRelayState(i + 1, state);
            } else {
                SIO::log("Relais " + String(i + 1) + " non installé, état ignoré.");
            }
        }
    }
    bool getRelayState(uint8_t relayId) {
        return relaysInstalled[relayId - 1] ? relaysState[relayId - 1] : false;
    }
    void toggleRelay(uint8_t relayId) {
        if(!relaysInstalled[relayId - 1]) {
            SIO::log("Relais " + String(relayId) + " non installé, état ignoré.");
            return;
        }
        setRelayState(relayId, !getRelayState(relayId));
    }
};