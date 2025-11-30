#include "RGBLight.hpp"
#include <Arduino.h>
#include "SIO.hpp"

namespace RGBLight
{
    Adafruit_NeoPixel strip;
    uint16_t NUM_PIXELS = 0;
    uint8_t BRIGHTNESS = 255;
    uint8_t R = 255;
    uint8_t G = 255;
    uint8_t B = 255;

    void initialize(GPIOPin gpioPin, uint16_t numPixels)
    {
        strip = Adafruit_NeoPixel(numPixels, gpioPin, NEO_GRB + NEO_KHZ800);
        NUM_PIXELS = numPixels;
        strip.begin();
        strip.clear();
        setColor(R, G, B);
    }

    void setBrightness(uint8_t brightness)
    {
        strip.setBrightness(brightness);
        BRIGHTNESS = brightness;
        strip.show();
        SIO::send("rgblight", "brightness " + String(brightness));
    }

    void setColor(uint8_t r, uint8_t g, uint8_t b)
    {
        R = r;
        G = g;
        B = b;
        for (int i = 0; i < NUM_PIXELS; i++)
        {
            strip.setPixelColor(i, strip.Color(r, g, b));
        }
        strip.show();
        SIO::send("rgblight", "color " + String(r) + " " + String(g) + " " + String(b));
    }

    void setLedColor(uint16_t pixelNum, uint8_t r, uint8_t g, uint8_t b)
    {
        if (pixelNum >= NUM_PIXELS) return;
        strip.setPixelColor(pixelNum, strip.Color(r, g, b));
        strip.show();
        //SIO::send("rgblight", "ledcolor " + String(pixelNum) + " " + String(r) + " " + String(g) + " " + String(b));
    }

    void setRangeColor(uint16_t fromPixel, uint16_t toPixel, uint8_t r, uint8_t g, uint8_t b)
    {
        for(uint16_t i = fromPixel; i <= toPixel; i++)
        {
            setLedColor(i, r, g, b);
        }
    }

    void turnOn()
    {
        strip.setBrightness(BRIGHTNESS);
        SIO::send("rgblight", "on");
    }

    void turnOff()
    {
        strip.setBrightness(0);
        SIO::send("rgblight", "off");
    }

    uint8_t getR()
    {
        return R;
    }
    uint8_t getG()
    {
        return G;
    }
    uint8_t getB()
    {
        return B;
    }
};