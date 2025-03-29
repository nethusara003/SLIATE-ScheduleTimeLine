import React, { useState, useEffect } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { ScheduleService } from '../TimeLineAPI.js';
import './ScheduleTimeline.css';

const ScheduleTimeline = ({ routes }) => {
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [arrivalTimes, setArrivalTimes] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (selectedRouteId) {
        try {
          const scheduleData = await ScheduleService.getSchedulesByRoute(selectedRouteId);
          setSchedules(scheduleData);
        } catch (error) {
          console.error("Error fetching schedules:", error);
        }
      }
    };

    fetchSchedules();
  }, [selectedRouteId]);

  const calculateArrivalTimes = () => {
    const schedule = schedules.find((sched) => sched._id === selectedScheduleId);
    const route = routes.find((route) => route._id === selectedRouteId);

    if (!schedule || !route) return;

    let times = [];
    let currentTime = new Date(`${schedule.date}T${schedule.startTime}`);

    route.stations.forEach((station) => {
      times.push({
        stationName: station.stationName,
        arrivalTime: currentTime.toTimeString().slice(0, 5)
      });
      currentTime.setMinutes(currentTime.getMinutes() + station.timeGap);
    });

    setArrivalTimes(times);
  };

  return (
    <div className="container-fluid px-4">
  {/* Title */}
  <h2 className="text-xl font-bold mb-4 text-center">Schedule Timeline</h2>

  {/* Dropdowns and Button */}
  <div className="d-flex flex-wrap gap-3 mb-4 justify-content-center">
    {/* Select Route */}
    <select 
      onChange={(e) => setSelectedRouteId(e.target.value)}
      className="form-select form-select-lg border-2 shadow-sm w-auto"
    >
      <option value="">Select Route</option>
      {routes.map((route) => (
        <option key={route._id} value={route._id}>
          {route.routeName}
        </option>
      ))}
    </select>

    {/* Select Schedule */}
    <select 
      onChange={(e) => setSelectedScheduleId(e.target.value)} 
      disabled={!selectedRouteId}
      className="form-select form-select-lg border-2 shadow-sm w-auto"
    >
      <option value="">Select Schedule</option>
      {schedules.map((sched) => (
        <option key={sched._id} value={sched._id}>
          {sched.date} - {sched.startTime}
        </option>
      ))}
    </select>

    {/* Generate Button */}
    <button 
      onClick={calculateArrivalTimes} 
      disabled={!selectedScheduleId}
      className="btn btn-success btn-lg shadow"
    >
      <i className="bi bi-graph-up me-2"></i> Generate Arrival Graph
    </button>
  </div>

  {/* Full-Width Timeline */}
  <div className="timeline-container bg-light p-4 rounded shadow">
    <VerticalTimeline>
      {arrivalTimes.map((station, idx) => (
        <VerticalTimelineElement
          key={idx}
          date={station.arrivalTime}
          iconStyle={{ background: "rgb(33, 150, 243)", color: "#fff" }} // Success green
          className="w-100"
        >
          <h4 className="fw-semibold">{station.stationName}</h4>
          <p className="text-muted">Arrival: {station.arrivalTime}</p>
        </VerticalTimelineElement>
      ))}
    </VerticalTimeline>
  </div>
</div>

  );
};

export default ScheduleTimeline;