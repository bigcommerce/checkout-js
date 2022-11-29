import React from 'react';

export default function Fees(props: any): any {
  const { schedules } = props;

  if (schedules.length == 0) {
    return null;
  }

  const formatTime = (h_24: any) => {
    const hour = parseInt(h_24.split(":")[0])
    const minute = h_24.split(":")[1]
    const meridiem = (hour >= 12) ? 'p.m.' : 'a.m.'
    var h = (hour + 11) % 12 + 1;
    return  (`${h}` + ':' + minute + " " + meridiem);
  }

  const formatSchedule = (scheduleHours: any) => {
    const hoursFrom = scheduleHours.split("-")[0];
    const hoursTo = scheduleHours.split("-")[1];

    return formatTime(hoursFrom) + " - " + formatTime(hoursTo);
  }

  return (
    <div className="dealer-schedule-list">
      <p>Business Hours:</p>
      <ul>
        {
          schedules.map(function(schedule: any) {
            return (<li>{`${schedule.day}: ${formatSchedule(schedule.hours)}`}</li>)
          })
        }
      </ul>
    </div>
  );
}
