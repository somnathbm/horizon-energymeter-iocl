import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as socketClient from 'socket.io-client';

@Component({
  selector: 'supply',
  templateUrl: 'supply.html'
})
export class SupplyLine {
  constructor() {
    this.openTunnel();
  }

  /* private scoped member variables */
  private sensorData = { servo_no: '', status: '', input_voltage: { ivr: '', ivy: '', ivb: '' }, output_voltage: { ovr: '', ovy: '', ovb: '' }, output_current: { ocr: '', ocy: '', ocb: '' }, recorded_on: '' };
  private isOnline = false;

  /**
  * initiate socket.io connection
  */
  openTunnel() {
    var socket = socketClient.connect('https://opto.mybluemix.net'),
        self = this;

        // capture dummy events
        socket.on('sensordata', function (data) {
          console.log('sensor data are coming...');
          console.log(data);
          self.sensorData = data;
          self.sensorData.status = 'online';
          self.isOnline = true;
        });

        // capture offline event
        socket.on('offline', function (data) {
          console.log('connection offline...');
          console.log(data);
          self.isOnline = false;
          self.sensorData = { servo_no: '----', status: 'offline', input_voltage: { ivr: '000.00', ivy: '000.00', ivb: '000.00' }, output_voltage: { ovr: '000.00', ovy: '000.00', ovb: '000.00' }, output_current: { ocr: '000.00', ocy: '000.00', ocb: '000.00' }, recorded_on: '' };
        });

        // capture connect events
        socket.on('connect', function () {
          console.log('tunnel opened...');
        });

        // capture error events
        socket.on('error', function () {
          console.log('tunnel closed...');
        });

        // capture disconnect events
        socket.on('disconnect', function () {
          console.log('tunnel disconnected...');
        });
  }
}
