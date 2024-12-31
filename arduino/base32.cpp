#include "Base32.h"

const char BASE32_ALPHABET[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

String Base32::encode(const uint8_t *data, size_t len) {
    String encoded;
    uint8_t buffer[5];
    size_t bufferLen = 0;

    for (size_t i = 0; i < len; i++) {
        buffer[bufferLen++] = data[i];
        if (bufferLen == 5) {
            encoded += BASE32_ALPHABET[buffer[0] >> 3];
            encoded += BASE32_ALPHABET[((buffer[0] & 0x07) << 2) | (buffer[1] >> 6)];
            encoded += BASE32_ALPHABET[(buffer[1] >> 1) & 0x1F];
            encoded += BASE32_ALPHABET[((buffer[1] & 0x01) << 4) | (buffer[2] >> 4)];
            encoded += BASE32_ALPHABET[((buffer[2] & 0x0F) << 1) | (buffer[3] >> 7)];
            encoded += BASE32_ALPHABET[(buffer[3] >> 2) & 0x1F];
            encoded += BASE32_ALPHABET[((buffer[3] & 0x03) << 3) | (buffer[4] >> 5)];
            encoded += BASE32_ALPHABET[buffer[4] & 0x1F];
            bufferLen = 0;
        }
    }

    if (bufferLen > 0) {
        memset(buffer + bufferLen, 0, 5 - bufferLen);

        encoded += BASE32_ALPHABET[buffer[0] >> 3];
        encoded += BASE32_ALPHABET[((buffer[0] & 0x07) << 2) | (buffer[1] >> 6)];
        if (bufferLen > 1) {
            encoded += BASE32_ALPHABET[(buffer[1] >> 1) & 0x1F];
            encoded += BASE32_ALPHABET[((buffer[1] & 0x01) << 4) | (buffer[2] >> 4)];
        } else {
            encoded += "======";
            return encoded;
        }

        if (bufferLen > 2) {
            encoded += BASE32_ALPHABET[((buffer[2] & 0x0F) << 1) | (buffer[3] >> 7)];
        } else {
            encoded += "====";
            return encoded;
        }

        if (bufferLen > 3) {
            encoded += BASE32_ALPHABET[(buffer[3] >> 2) & 0x1F];
            encoded += BASE32_ALPHABET[((buffer[3] & 0x03) << 3) | (buffer[4] >> 5)];
        } else {
            encoded += "===";
            return encoded;
        }

        encoded += BASE32_ALPHABET[buffer[4] & 0x1F];
    }

    return encoded;
}

// Base32 decoding table
// const char BASE32_ALPHABET[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

std::vector<uint8_t> Base32::decode(const String &encoded) {
    std::vector<uint8_t> decoded;
    size_t len = encoded.length();

    int buffer = 0;
    int bitsLeft = 0;

    for (size_t i = 0; i < len; ++i) {
        char c = toupper(encoded[i]);

        if (c == '=') break; // Padding character, stop decoding

        const char *pos = strchr(BASE32_ALPHABET, c);
        if (!pos) continue; // Skip invalid characters

        buffer <<= 5; // Shift buffer by 5 bits
        buffer |= (pos - BASE32_ALPHABET) & 0x1F; // Add 5 bits from Base32 character
        bitsLeft += 5;

        if (bitsLeft >= 8) {
            decoded.push_back((buffer >> (bitsLeft - 8)) & 0xFF);
            bitsLeft -= 8;
        }
    }

    return decoded;
}