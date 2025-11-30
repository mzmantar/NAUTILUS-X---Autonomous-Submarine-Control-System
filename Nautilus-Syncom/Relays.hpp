#ifndef RELAYS_HPP
#define RELAYS_HPP
#include <Arduino.h>

typedef uint8_t GPIOPin;

namespace Relays {
    void initialize();
    void addRelay(uint8_t relayId, GPIOPin gpioPin);
    void addRelay(uint8_t relayId, GPIOPin gpioPin, bool internal);
    void setRelayState(uint8_t relayId, bool state);
    void setAllRelaysState(bool state);
    bool getRelayState(uint8_t relayId);
    void toggleRelay(uint8_t relayId);    

    extern const uint8_t NB_RELAYS;
    extern bool relaysInternal[];
    extern bool relaysInstalled[];
    extern bool relaysState[];
    extern GPIOPin relaysPins[];
};

#endif