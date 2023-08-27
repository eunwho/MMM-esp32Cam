/* global Module */

/* 
* Magic Mirror Module: MMM-esp32CamDoorBell
 * By Soonkil Jung
 * MIT Licensed.
 */
Module.register("MMM-esp32CamDoorBell", {
	defaults: {
		host: "192.168.45.230",
		port: "8885",
		maxWidth:"50%",
//		imageBuff : "mmm_test.jpg",
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	// Overrides start function.
	start: function () {
		var self = this;
		self.sendSocketNotification("WS_CONNECT", { "config": self.config });
	},

	// Override notification received
	notificationReceived: function(notification, payload, sender) {
		var self = this;
	},

	// Override socket notification received
	socketNotificationReceived: function(notification, payload) {
		var self = this

		if(notification === 'ESP32_CAM'){		
			let md = JSON.parse(payload);
			// console.log( md.devices.mmm_esp32Cam)
			if(md.devices.mmm_esp32Cam.image){
				document.querySelector('#image1').src = "data:image/jpeg;base64," + md.devices.mmm_esp32Cam.image;
			}
		}
		self.updateDom
	},

	debug: function() {
		var self = this;
		if(self.config.debug) {
			Log.log.apply(self, arguments);
		}
	},

	error: function() {
		var self = this;
		Log.error.apply(self, arguments);
	},

	getDom: function () {
		var wrapper = document.createElement("div")
		wrapper.className = "mmm-esp32Cam"

		var image = document.createElement("img")
		image.className= 'image1'
		image.src ="https://community.thriveglobal.com/wp-content/uploads/2020/06/summer.jpg"
		image.id = "image1";
		image.style.maxWidth = "50%"
		image.style.maxHeight = "50%"
		image.style.opacity = "1.0"
		wrapper.appendChild(image)
		return wrapper;
	},
/*	// Override dom generator.
	getDom: function () {
		const self = this
		var wrapper = document.createElement('div')
		var imageWrapper = document.createElement('img',{id:"esp32Cam",className:"esp32Cam"})
		imageWrapper.src = self.imageBuff
		//imageWrapper.src = "/home/ew/MagicMirror/mmm_test.jpg"
		//imageWrapper.className = "esp32Cam"
		imageWrapper.style.maxWidth = self.config.maxWidth
		wrapper.appendChild(imageWrapper)
		return wrapper
	}
*/	
});