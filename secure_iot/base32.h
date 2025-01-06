#ifndef BASE32_H
#define BASE32_H

#include <Arduino.h>
#include <vector>

class Base32 {
public:
    static String encode(const uint8_t *data, size_t len);
    static std::vector<uint8_t> decode(const String &encoded);
};

#endif
