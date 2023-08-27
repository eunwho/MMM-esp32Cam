/* global Module */

/* 
* Magic Mirror Module: MMM-esp32CamDoorBell
 * By Soonkil Jung
 * MIT Licensed.
 */

let esp32CamTimer1 = false
let esp32CamTimer2 = false

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

			if ( esp32CamTimer1 === false ){
				console.log('enter this 1')
				document.querySelector('#image1').style.opacity = "1.0"
				self.updateDom

				esp32CamTimer1 = true
				esp32CamTimer2 = false

				const timerCamId2 = setTimeout(() => { 
					console.log('enter this 2')
					esp32CamTimer2 = true ; 
					document.querySelector('#image1').style.opacity = "0.0"
					self.updateDom
				}, 30000);

				const timerCamId1 = setTimeout(() => { 
					console.log('enter this 3')
					esp32CamTimer1 = false  
					esp32CamTimer2 = false
					//this.hide 
					document.querySelector('#image1').style.opacity = "0.0"
					self.updateDom
				}, 100000);							

			}	

			if((esp32CamTimer1 === true ) && ( esp32CamTimer2 === false ) ){
				let md = JSON.parse(payload);
				// console.log( md.devices.mmm_esp32Cam)
				if(md.devices.mmm_esp32Cam.image){
					document.querySelector('#image1').src = "data:image/jpeg;base64," + md.devices.mmm_esp32Cam.image;
					self.updateDom
				}
			}else {
				document.querySelector('#image1').style.opacity = "0.0"
				self.updateDom
			}
		}
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
		//image.src ="https://community.thriveglobal.com/wp-content/uploads/2020/06/summer.jpg"
		image.id = "image1";
		image.style.maxWidth = "50%"
		image.style.maxHeight = "50%"
		image.style.opacity = "0.0"
		wrapper.appendChild(image)
		return wrapper;
	}
});