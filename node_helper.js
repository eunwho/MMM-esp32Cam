/* global Module */

/* Magic Mirror Module: MMM-esp32CamDoorBell
 * By Soonkil Jung
 * MIT Licensed.
 */
const NodeHelper = require("node_helper");
const path = require('path');
const WebSocket = require('ws');

let clients=[]

let devices ={
	relay_modules1 : { port : 8885},
}
let count = 0;

module.exports = NodeHelper.create({
	socketNotificationReceived: function (notification, payload) {
		var self = this;

		if(notification === "WS_CONNECT") {
			self.config = payload.config;
			self.connect(payload.config);
			return;
		} else if(notification === "WS_DISCONNECT") {
			// Disconnect event will be handeled internally
			self.config = undefined;
			self.disconnect();
			return;
		}

		// Forward all other socket notifications
		if(self.ws && self.ws.readyState === WebSocket.OPEN) {
			const obj = {
				type: notification,
				payload: payload
			};

			self.ws.send(JSON.stringify(obj), function ack(error){
				if(error) {
					self.error("Error while sending obj: ", obj);
				}
			});
		} else {
			self.debug("Can not send notification because WebSocket is not yet connected!", notification)
		}
	},

	connect: function(config, callback) {
		var self = this;

		Object.entries(devices).forEach(([key]) => {
			const device = devices[key];
			
			new WebSocket.Server({port: device.port}, () => console.log(`WS Server is listening at ${device.port}`)).on('connection',(ws) => {
				ws.on('message', data => {
					if (ws.readyState !== ws.OPEN) return;		
					// console.log(data);
					if (device.command) {
						ws.send(device.command);
						device.command = null; // Consume
					}		
					if (typeof data === 'object') {
						device.image = Buffer.from(Uint8Array.from(data)).toString('base64');
					} else {
						device.peripherals = data.split(",").reduce((acc, item) => {
							const key = item.split("=")[0];
							const value = item.split("=")[1];
							acc[key] = value;
							return acc;
						}, {});
					}	
					this.sendSocketNotification("ESP32_CAM",JSON.stringify({ devices: devices }));
				});
			});
		});
	},

	sendMessage: function(event) {
		var self = this;
		self.debug("Send event: ", event);
		self.sendSocketNotification(event.type, event.payload);
	},

	reconnect: function(config) {
		var self = this;
		self.debug("Trying to reconnect...");
		self.connect(config, function(error) {
			if(error) {
				self.error("Error while reconnecting to websocket...", error);
				setTimeout(function() { self.reconnect(config) }, config.reconnectInterval);
			}
		});
	},

	disconnect: function() {
		var self = this;
		if (self.ws) {
			// Unregister listener
			self.ws.onclose = undefined;
			self.ws.onerror = undefined;
			self.ws.onopen = undefined;
			self.ws.onmessage = undefined;

			if(self.ws.readyState === WebSocket.OPEN) {
				self.ws.close();
				self.ws.terminate();
			}
			self.ws = undefined;
		}
	},

	debug: function() {
		var self = this;
		if(self.config.debug) {
			console.log.apply(self, arguments);
		}
	},

	error: function() {
		var self = this;
		console.error.apply(self, arguments);
	},
});