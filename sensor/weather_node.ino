#include <Arduino.h>
#include <SI7021.h>
#include "wiring_private.h"
#include "keys.h"

SI7021 sensor;
long previousMillis = 0;

// 5 minute sensor readings
long interval = 5 * 60 * 1000;

// Serial2
// TX on D2 (SERCOM4.2) and RX on D5 (SERCOM4.3)
Uart Serial2 (&sercom4, 2, 5, SERCOM_RX_PAD_3, UART_TX_PAD_2);
void SERCOM4_Handler()
{
  Serial2.IrqHandler();
}

void setup() {

    // allow uploader to connect on restart
    delay(5000);


    // serial monitor on SerialUSB, SI7021 on Serial1, RAK LoRa Module on Serial2
    SerialUSB.begin(115200);
    Serial.begin(115200);
    Serial2.begin(115200);
  
    // Assign pins 2 & 5 SERCOM_ALT functionality
    pinPeripheral(2, PIO_SERCOM_ALT);
    pinPeripheral(5, PIO_SERCOM_ALT);

    // wait for serial ports to activate
    delay(7000);
  
    SerialUSB.print("Initializing sensor... ");
    if(!sensor.begin()){
        SerialUSB.println("Sensor not found!");
        while(true);
    }
    SerialUSB.println("Sensor initialized.");

    // reset the RAK811
    //setConnConfig("device", "restart");    

    // join using ABP mode
    SerialUSB.println("[SETUP] set device address");
    setConnConfig("lora:dev_addr", DEVICE_ADDRESS);
    delay(2000);
    SerialUSB.println("[SETUP] set network session key");
    setConnConfig("lora:nwks_key", NETWORK_SESSION_KEY);         
    delay(2000);
    SerialUSB.println("[SETUP] set app session key");
    setConnConfig("lora:apps_key", APP_SESSION_KEY);
    delay(2000);
    SerialUSB.println("[SETUP] join mode ABP");
    sendCommand("at+set_config=lora:join_mode:1\r\n");
    delay(2000);
    SerialUSB.println("[SETUP] send join request");
    sendCommand("at+join\r\n");
}

void loop() {
  unsigned long currentMillis = millis();
 
    if(currentMillis - previousMillis > interval) {
        // save the last time you read the temperature 
        previousMillis = currentMillis;
        
        float temp=sensor.getFahrenheitHundredths()/100.0;
        int relativeHumidity=sensor.getHumidityPercent();
        SerialUSB.print(temp);
        SerialUSB.print(" deg Fahrenheit\t");
        SerialUSB.print(relativeHumidity);
        SerialUSB.println("% relative humidity");

        String payload = "";
        String one_byte = "";
        byte bytes[4];

        float2Bytes(temp, &bytes[0]);
        for (int i=0; i<4; i++) {
          one_byte = String(bytes[i], HEX);
          if (one_byte.length() == 1) {
            one_byte = '0' + one_byte;
          }
          payload.concat(one_byte);
        }
        float2Bytes(float(relativeHumidity), &bytes[0]);
        for (int i=0; i<4; i++) {
          one_byte = String(bytes[i], HEX);
          if (one_byte.length() == 1) {
            one_byte = '0' + one_byte;
          }
          payload.concat(one_byte);
        }
              
        payload.toUpperCase();
                       
        SerialUSB.println("Sending readings as: " + payload + " " + payload.length() + " bytes");
        sendData(1, payload); // payload bytes 0 - 3 temp, bytes 4 - 7 humidity
    }

    // read from port Serial2, send to SerialUSB:
    if (Serial2.available()) {
        int inByte = Serial2.read();
        SerialUSB.write(inByte);
    }

    
    // read from SerialUSB - debugging commands to control the radio
    if (SerialUSB.available()) {
        int inByte = SerialUSB.read();

        float reading = 0.0;
        String payload = "";
        String one_byte = "";
        byte bytes[4];

        switch(inByte) {
          case 'w':
              SerialUSB.println("[DEBUG] sent command ***");
              sendCommand("***\r\n");
              break;
          case 'v':
              SerialUSB.println("[DEBUG] sent command at+version");
              sendCommand("at+version\r\n");
              break;
          case 'h':
              SerialUSB.println("[DEBUG] sent command at+help");
              sendCommand("at+help\r\n");
              break;
          case 's':
              SerialUSB.println("[DEBUG] sent command at+get_config=device:status");
              sendCommand("at+get_config=device:status\r\n");
              break;
          case '1':
              SerialUSB.println("[DEBUG] set device eui");
              setConnConfig("lora:dev_eui", DEVICE_EUI);
              break;
          case '2':
              SerialUSB.println("[DEBUG] set app eui");
              setConnConfig("lora:app_eui", APP_EUI);
              break;
          case '3':
              SerialUSB.println("[DEBUG] set app key");
              setConnConfig("lora:app_key", APP_KEY);
              break;
          case '6':
              SerialUSB.println("[DEBUG] set device address");
              setConnConfig("lora:dev_addr", DEVICE_ADDRESS);
              break;
          case '7':
              SerialUSB.println("[DEBUG] set network session key");
              setConnConfig("lora:nwks_key", NETWORK_SESSION_KEY);
              break;
          case '8':
              SerialUSB.println("[DEBUG] set app session key");
              setConnConfig("lora:apps_key", APP_SESSION_KEY);
              break;
          case '9':
              SerialUSB.println("[DEBUG] join mode ABP");
              sendCommand("at+set_config=lora:join_mode:1\r\n");
              break; 
          case 'j':
              SerialUSB.println("[DEBUG] send join request");
              sendCommand("at+join\r\n");
              break;
          case 'l':
              SerialUSB.println("[DEBUG] get lora status");
              sendCommand("at+get_config=lora:status\r\n");
              break;
          case 'x':
              SerialUSB.println("[DEBUG] set tx_power to 7 = Max EIRP-14dB");
              sendCommand("at+set_config=lora:tx_power:7\r\n");
              break;
          case 'p':
              SerialUSB.println("[DEBUG] set tx_power to 0 = Max EIRP");
              sendCommand("at+set_config=lora:tx_power:0\r\n");
              break;             
          case 't':
              SerialUSB.println("[DEBUG] send a test packet to gateway");
              //sendData(1,"48656C6C6F"); // payload "Hello"

              reading = 3.141592;
              float2Bytes(reading, &bytes[0]);
              for (int i=0; i<4; i++) {
                one_byte = String(bytes[i], HEX);
                if (one_byte.length() == 1) {
                  one_byte = '0' + one_byte;
                }
                payload.concat(one_byte);
              }
              SerialUSB.println(payload);
              
              reading = 72.5;
              float2Bytes(reading, &bytes[0]);
              for (int i=0; i<4; i++) {
                one_byte = String(bytes[i], HEX);
                if (one_byte.length() == 1) {
                  one_byte = '0' + one_byte;
                }
                payload.concat(one_byte);
              }
              SerialUSB.println(payload);
              
              payload.toUpperCase();
                       
              SerialUSB.println("Sending 3.141592, 72.5 as: " + payload + " " + payload.length() + " bytes");
              
              sendData(1, payload); // payload bytes 0 - 3 temp, bytes 4 - 7 humidity 
              break;
          default:
              break;
        }
        
    }
}

void float2Bytes(float val, byte* bytes_array){
  union {
    float f;
    byte temp_array[4];
  } u;
  u.f = val;
  memcpy(bytes_array, u.temp_array, 4);
}

/** 
* Function to send a command to the  
* lora node
*/ 

void sendCommand(String atComm){ 
    //String response = ""; 
    Serial2.print(atComm); 
    //while(Serial2.available()){ 
    //    char ch = Serial2.read(); 
    //    response += ch; 
    //} 
    //SerialUSB.println(response); 
}


/** 
* send the rak811 to sleep for time  
* specified in millis paramteer 
*/ 

void sleep(unsigned long milliseconds){ 
 sendCommand("at+sleep\r\n"); 
 delay(milliseconds); 
 //send any charcater to wakeup; 
 sendCommand("***\r\n"); 
} 


/** 
* reset board after the specified time delay millisenconds 
* <mode> = 0 Reset and restart module 
= 1 Reset LoRaWAN or LoraP2P stack and Module will reload LoRa 
configuration from EEPROM 
*/ 

void resetChip(int mode, unsigned long delaySec=0){ 
 delay(delaySec); 
 String command = (String)"at+reset=" + mode + (String)"\r\n"; 
 sendCommand(command); 
} 


/** 
* Reload the default parameters of LoraWAN or LoraP2P setting 
*/ 

void reload(unsigned long delaySec){ 
 delay(delaySec); 
 sendCommand("at+reload\r\n"); 
} 


/** 
* Function to set module mode 
* <mode> = 0 LoraWAN Mode (default mode) 
= 1 LoraP2P Mode 
*/ 

void setMode(int mode){ 
 String command = (String)"at+mode=" + mode + (String)"\r\n"; 
 sendCommand(command);   
} 


/** 
* Function to send data to a lora gateway; 
* <type> = 0 send unconfirmed packets 
= 1 send confirmed packets 
<port> = 1-223 port number from 1 to 223 
<data>= <hex value> hex value(no space). The Maximum length of <data> 64 bytes 
*/ 

void sendData(int port, String data){ 
 String command = (String)"at+send=lora:" + port + ":" + data + (String)"\r\n"; 
 sendCommand(command); 
} 


/** 
* Function to send a join request 
* allowed methods "otaa" and "abp" 
*/ 

void sendJoinReq(String method){ 
 //String command = (String)"at+join=" + method + "\r\n";
 String command = (String)"at+join\r\n"; 
 sendCommand(command); 
} 


/** 
* Function to set the connection config 
* < dev_addr >:<address> <address>-------------------4 bytes hex number representing the device address from 00000001 – FFFFFFFE 
<dev_eui>:<eui> <eui>-------------------------- 8-byte hexadecimal number representing the device EUI 
<app_eui>:<eui> <eui>----------------------------8-byte hexadecimal number representing the application EUI 
<app_key>:<key> <key>----------------------------16-byte hexadecimal number representing the application key 
<nwks_key>:<key> <key>-------------------------16-byte hexadecimal number representing the network session key 
<apps_key>:<key> <key>------------------------ 16-byte hexadecimal number representing the application session key 
<tx_power>:<dbm> <dbm>------------------- LoRaWAN Tx Power 
<adr>:<status> <status>----------------------------- string value representing the state, either “on” or “off”. 
<dr>:<data rate> <data rate>-----------------------decimal number representing the data rate, from 0 and 4, but within the limits of the data rate range for the defined channels. 
< public_net >:<status> <status>------------------- string value representing the state, either “on” or “off”. 
< rx_delay1 >:<delay> <delay>-------------------decimal number representing the delay between the transmission and the first Reception window in milliseconds, from 0 to 65535. 
*/

void setConnConfig(String key, String value){ 
 sendCommand("at+set_config=" + key + ":" + value + "\r\n"); 
} 
