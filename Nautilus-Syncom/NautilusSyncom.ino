#include <Arduino.h>
#include "SIO.hpp"
#include "Commands.hpp"
#include "Motors.hpp"
#include "RGBLight.hpp"
#include "Relays.hpp"
#include "SensorHook.hpp"

bool isready = false;

int SENSOR_PINGS_FRAME_INTERVALS = 4;
int FRAMES_DELAY_MS = 100;

void setup() {
  delay(1000);

  SIO::initialize(115200);
  SIO::log("Serial initialisé");
  delay(500);

  Relays::initialize();
  Relays::addRelay(1, 27);
  Relays::addRelay(2, 26);
  Relays::addRelay(3, 33);
  Relays::addRelay(4, 32);
  SIO::log("Relais initialisés");
  Relays::setAllRelaysState(false);
  delay(500);

  RGBLight::initialize(19, 25);
  SIO::log("Bande RGB initialisée");
  delay(500);
  RGBLight::setColor(0, 0, 0);
  delay(500);
  RGBLight::setColor(255, 255, 255);
  delay(1000);
  RGBLight::setColor(0, 0, 0);
  delay(1000);
  // -----------
  RGBLight::setRangeColor(0, 8, 255, 180, 0);
  delay(500);

  Motors::initialize();
  SIO::log("Moteurs initialisés");
  Motors::addMotor(1, 13, true);
  Motors::addMotor(2, 15);
  SIO::log("Moteurs ajoutés");
  RGBLight::setRangeColor(0, 16, 255, 180, 0);
  delay(500);

  Sensors::initializeSensors();
  RGBLight::setRangeColor(0, 20, 255, 180, 0);
  delay(500);
  RGBLight::setColor(0, 255, 0);
  delay(1000);
  RGBLight::setColor(0, 0, 0);
  for(int i=0; i<24; i++) {
    for(int j=1; j <= 10; j++) {
      RGBLight::setLedColor(i, 0, 0, 255 * j / 10);
      delay(20);
    }
  }
  delay(500);
  for(int i=0; i<=200; i+=5) {
    RGBLight::setColor(0, 0, 200-i);
    delay(100);
  }
  RGBLight::setColor(0, 0, 0);
  isready = true;
  SIO::raw("readyok");
}

int frames = 0;

void loop() {
  frames++;
  frames%=SENSOR_PINGS_FRAME_INTERVALS;
  if (frames == 0) {
    Sensors::tick();
  }
  if (SIO::hasCommandAvailable()) {
    String command = SIO::readCommand();
    
    if      (command == "isready")  Commands::isready();
    else if (command == "motor")    Commands::motor();
    else if (command == "rgblight") Commands::rgblight();
    else if (command == "relay") Commands::relay();
    else if (command == "sensors") Commands::sensors();
    else {
      SIO::log("Commande inconnue ou débris: " + command);
      SIO::cleanCommand();
    }

    SIO::cleanRemaining();
  }
  delay(FRAMES_DELAY_MS);
}