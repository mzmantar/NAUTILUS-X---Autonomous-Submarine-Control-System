#include "SIO.hpp"
#include <Arduino.h>

namespace SIO
{
    const int BUFFER_SIZE = 100;
    char buffer[BUFFER_SIZE] = {0};
    char remaining[BUFFER_SIZE] = {0};
    bool commandPrepared = false;

    void initialize(int baudRate)
    {
        Serial.begin(baudRate);
    }

    void log(String message)
    {
        Serial.println("# " + message);
    }

    void raw(String data)
    {
        Serial.println(data);
    }

    void send(String command, String data)
    {
        Serial.print(command);
        if (data.length() > 0)
        {
            Serial.print(" ");
            Serial.print(data);
        }
        Serial.println();
    }

    void readSerial()
    {
        int idx = 0;
        while(buffer[idx] != '\0' && idx < BUFFER_SIZE - 1)
        {
            idx++;
        }

        while (Serial.available() > 0 && idx < BUFFER_SIZE - 1)
        {
            char c = Serial.read();
            if (c == '\n' || c == '\r')
            {
                if (idx == 0)
                    continue;
                commandPrepared = true;
                break;
            }
            buffer[idx++] = c;
            buffer[idx] = '\0';
        }

        strncpy(remaining, buffer, BUFFER_SIZE);
        remaining[BUFFER_SIZE - 1] = '\0';
    }

    bool hasCommandAvailable()
    {
        if (Serial.available() > 0)
        {
            readSerial();
            return false;
        } else {
            if (commandPrepared) {
                commandPrepared = false;
                return true;
            } else {
                return false;
            }
        }
    }

    String readCommand()
    {
        return nextArgument();
    }

    String nextArgument()
    {
        if (remaining[0] == '\0') return "";

        char *space = strchr(remaining, ' ');
        if (space) {
            *space = '\0'; // Null-terminate the command
            String arg = String(remaining);
            strncpy(remaining, space + 1, BUFFER_SIZE - 1);
            remaining[BUFFER_SIZE - 1] = '\0'; // Ensure null termination
            return arg;
        } else {
            String arg = String(remaining);
            remaining[0] = '\0'; // Clear remaining buffer
            return arg;
        }
    }

    void cleanRemaining()
    {
        remaining[0] = '\0';
    }

    void cleanCommand()
    {
        buffer[0] = '\0';
        commandPrepared = false;
    }
}