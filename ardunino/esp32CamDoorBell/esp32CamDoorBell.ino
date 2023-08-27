#include "esp_camera.h"
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include "ssid_pw.h"

#define CAMERA_MODEL_AI_THINKER // Has PSRAM
#include <stdio.h>
#include "camera_pins.h"

// ===========================
// Enter your WiFi credentials
// ===========================
const char* ssid      = WIFI_SSID;
const char* password  = WIFI_PASSWORD;
const char* websocket_server_host = "192.168.45.230";
const uint16_t websocket_server_port1 = 8885;

using namespace websockets;
WebsocketsClient client;

void startCameraServer();
void setupLedFlash(int pin);

int count =0;
void setup() {

  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_JPEG; // for streaming
  config.frame_size = FRAMESIZE_SVGA;
  config.jpeg_quality = 40;
  config.fb_count = 2;

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  sensor_t * s = esp_camera_sensor_get();
  // initial sensors are flipped vertically and colors are a bit saturated
 
  s->set_contrast(s, 0); 
  s->set_raw_gma(s, 1);

  WiFi.begin(ssid, password);
//  WiFi.setSleep(false);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");

  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");

  delay(5000);
}

void loop() {

  while(!client.connect(websocket_server_host, websocket_server_port1, "/")){ delay( 500 ); }

  client.poll();
  camera_fb_t *fb = esp_camera_fb_get();

  if(!fb){
    esp_camera_fb_return(fb);
    // Serial.println('frame error');
    return;
  } 
  
  if(fb->format != PIXFORMAT_JPEG ) { 
    // Serial.println('format error');    
    return ;
   }

  client.sendBinary( ( const char * ) fb ->buf, fb ->len );
  esp_camera_fb_return(fb);
/*  
  float h =12.34;
  float t = 56.78;

  String output = "temp=" + String(t, 2) + ",hum=" + String( h, 2 ) + ", light = 12";

  //client.send(output);
  // Do nothing. Everything is done in another task by the web server
  
  if ( count > 50 ){
    count = 0;
    Serial.println(count);
  }  
  count ++;
*/
  delay(1000);
}
