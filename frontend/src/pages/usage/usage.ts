import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ChartsModule, BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'usage',
  templateUrl: 'usage.html'
})
export class Usage {
  constructor() {}

  // memeber variables
  private requestedDataType = 'input_voltage';

  /* variables required for the chart rendering purpose which are treated like pointers */
  // chart options
  private lineChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  // chart labels
  private lineChartLabels = ['7:52 AM', '8:02 AM', '8:12 AM', '8:22 AM', '8:32 AM', '8:42 AM', '8:52 AM'];

  // chart type
  private lineChartType = 'line';

  // chart legends
  private lineChartLegend = true;

  // actual chart data
  private lineChartData = [
    { data: [7.23, 9.34, 12.45, 6.67, 0, 8.89, 4.45], label: 'Vri', fill: false },
    { data: [9.83, 12.5, 18, 9.96, 0, 18.32, 8.45], label: 'Vyi', fill: false },
    { data: [12.04, 14, 26, 23, 0, 9.54, 11], label: 'Vbi', fill: false }
  ];


  computeTimestamps(duration, steps, servo) {
    /* @params                                                                                                /
    /* - duration - the requested time as in `previous hour` or `previous day` in milisecond representation   /
    /* - steps    - the requested steps as in `10 mins` or `4 hrs` or `1 days`                                /
    /**/
    var now = Date.now();
    var srcTime = now - duration;
    var timestampArr = [];
    var timestampData;
    // push the src timestamp to the array first
    timestampArr.push(srcTime, now);
    timestampData = { timestamps: timestampArr, duration: duration, servo_no: servo, request_for: this.requestedDataType, criteria: steps };
    console.log('Timestamps of last hour...');
    console.log(timestampArr);
    this.queryData(timestampData);
  }

  queryData(timestampdata) {

  }

  watchPastHour(capturedHoursHand, capturedMinutesHand) {
    //console.log('captured time hours: ' + capturedHoursHand);
    //console.log('captured time minutes: ' + capturedMinutesHand);
    var prevHourTimesArr = [];
    var prevHoursHand = capturedHoursHand - 1;
    var formattedPrevHoursTime;
    //let current10Minutes: number;
    formattedPrevHoursTime = this.formatTimeString(prevHoursHand, capturedMinutesHand);
    // now insert the first time of prev hour in the previous hour time array
    prevHourTimesArr.push(formattedPrevHoursTime);
    //console.log('processed prev hours time: ' + formattedPrevHoursTime);
    // loop through 5 times to get the remaining 5 times in 10 minutes steps
    for (var i = 0; i < 6; i++) {
      var current10Minutes = capturedMinutesHand += 10;
      if (current10Minutes >= 60) {
        prevHoursHand++;
        current10Minutes = capturedMinutesHand = current10Minutes % 60;
      }
      // format time here
      formattedPrevHoursTime = this.formatTimeString(prevHoursHand, current10Minutes);
      // push the values in the array
      prevHourTimesArr.push(formattedPrevHoursTime);
    }
    // print the array
    console.log('resulting array is.....');
    console.log(prevHourTimesArr);
  }

  formatTimeString(hoursHand, minutesHand) {
    var formattedString;
    var tempMin;
    if (hoursHand % 12 == hoursHand) {
      tempMin = minutesHand < 10 ? '0' + minutesHand : minutesHand;
      formattedString = hoursHand + ':' + tempMin + ' AM';
    }
    else if (hoursHand % 12 == 0) {
      tempMin = minutesHand < 10 ? '0' + minutesHand : minutesHand;
      formattedString = hoursHand + ':' + tempMin + ' PM';
    }
    else {
      hoursHand = hoursHand % 12;
      tempMin = minutesHand < 10 ? '0' + minutesHand : minutesHand;
      formattedString = hoursHand < 10 ? '0' + hoursHand + ':' + tempMin + ' PM' : hoursHand + ':' + tempMin + ' PM';
    }
    return formattedString;
  }

  renderChart(type) {
    
  }
}
