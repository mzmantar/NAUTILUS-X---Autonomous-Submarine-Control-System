#ifndef RGBLIGHT_HPP
#define RGBLIGHT_HPP
#include <Arduino.h>
#include <Adafruit_NeoPixel.h> 

typedef uint8_t GPIOPin;

namespace RGBLight {
    void initialize(GPIOPin gpioPin, uint16_t numPixels);

    void setBrightness(uint8_t brightness);
    void setColor(uint8_t r, uint8_t g, uint8_t b);
    void setLedColor(uint16_t pixelNum, uint8_t r, uint8_t g, uint8_t b);
    void setRangeColor(uint16_t fromPixel, uint16_t toPixel, uint8_t r, uint8_t g, uint8_t b);
    void turnOn();
    void turnOff();

    uint8_t getR();
    uint8_t getG();
    uint8_t getB();



    extern Adafruit_NeoPixel strip;
    extern uint16_t NUM_PIXELS;
    extern uint8_t BRIGHTNESS;
    extern uint8_t R;
    extern uint8_t G;
    extern uint8_t B;
};

#endif