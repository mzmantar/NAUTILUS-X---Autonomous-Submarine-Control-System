#ifndef SIO_HPP
#define SIO_HPP
#include <Arduino.h>

namespace SIO {
    void initialize(int baudRate);
    void log(String message);
    void send(String command, String data);
    void raw(String data);
    bool hasCommandAvailable();
    void readSerial();
    String readCommand();
    String nextArgument();
    void cleanRemaining();
    void cleanCommand();
    
    extern const int BUFFER_SIZE;
    extern char buffer[];
    extern char remaining[];
    extern bool commandPrepared;
};

#endif