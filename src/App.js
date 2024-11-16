import React, { useState, useEffect } from 'react';

function App() {
  const [loginTime, setLoginTime] = useState('');
  const [logoutTime, setLogoutTime] = useState('');
  const [breaks, setBreaks] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [result, setResult] = useState(null);
  const [resultColorClass, setResultColorClass] = useState('');

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to parse time string (HH:MM) or (HH:MM:SS) into total seconds
  const parseTimeToSeconds = (time) => {
    if (!time) return 0; // If no time provided, return 0 seconds

    // Ensure the time has a seconds part (add ":00" if not present)
    const timeParts = time.split(':');
    if (timeParts.length === 2) {
      time += ':00'; // Add seconds if missing
    }

    const [hours, minutes, seconds] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      console.error(`Invalid time format: ${time}`); // Debugging invalid input
      return NaN; // Return NaN if any part is invalid
    }

    return hours * 3600 + minutes * 60 + seconds;
  };

  // Function to format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = Math.floor(absSeconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Function to add a break
  const addBreak = () => {
    setBreaks([...breaks, { breakOut: '', breakIn: '' }]);
  };

  // Function to remove a break
  const removeBreak = (index) => {
    const newBreaks = [...breaks];
    newBreaks.splice(index, 1);
    setBreaks(newBreaks);
  };

  // Function to calculate work time
  const calculateWorkTime = () => {
    if (!loginTime || !logoutTime) {
      setResult('Please enter login and logout times.');
      setResultColorClass('');
      return;
    }

    const loginSeconds = parseTimeToSeconds(loginTime);
    const logoutSeconds = parseTimeToSeconds(logoutTime);
    const penaltyThreshold = parseTimeToSeconds('09:15:00'); // Define penalty threshold

    console.log('Login Seconds:', loginSeconds);
    console.log('Logout Seconds:', logoutSeconds);

    let penaltyMessage = '';

    if (isNaN(loginSeconds) || isNaN(logoutSeconds)) {
      setResult('Invalid login or logout time format.');
      setResultColorClass('');
      return;
    }

    if (loginSeconds >= logoutSeconds) {
      setResult('Logout time must be after login time.');
      setResultColorClass('');
      return;
    }

    if (loginSeconds > penaltyThreshold) {
      penaltyMessage = 'You have incurred a penalty for not being on time.';
    }

    let totalBreakSeconds = 0;

    // Loop through breaks and calculate the total break time
    for (let i = 0; i < breaks.length; i++) {
      const breakTime = breaks[i];
      const breakOutSeconds = parseTimeToSeconds(breakTime.breakOut);
      const breakInSeconds = parseTimeToSeconds(breakTime.breakIn);

      console.log(`Break ${i + 1} Out Seconds:`, breakOutSeconds);
      console.log(`Break ${i + 1} In Seconds:`, breakInSeconds);

      // Validate break times (must be within login/logout bounds and breakOut < breakIn)
      if (isNaN(breakOutSeconds) || isNaN(breakInSeconds)) {
        setResult('Invalid break times.');
        setResultColorClass('');
        return;
      }

      if (breakOutSeconds >= breakInSeconds || breakOutSeconds < loginSeconds || breakInSeconds > logoutSeconds) {
        setResult('Invalid break times.');
        setResultColorClass('');
        return;
      }

      // Calculate break duration in seconds and accumulate
      totalBreakSeconds += (breakInSeconds - breakOutSeconds);
    }

    // Calculate total work duration in seconds (excluding breaks)
    const workDurationSeconds = logoutSeconds - loginSeconds;
    const effectiveWorkDurationSeconds = workDurationSeconds - totalBreakSeconds;

    const requiredWorkDurationSeconds = 8 * 3600; // 8 hours in seconds
    const remainingTimeSeconds = requiredWorkDurationSeconds - effectiveWorkDurationSeconds;

    // Format break duration in HH:MM:SS
    const totalBreakTimeFormatted = formatTime(totalBreakSeconds);

    if (remainingTimeSeconds > 0) {
      setResult(`You need to work for ${formatTime(remainingTimeSeconds)} more to complete the 8-hour requirement, Break time: ${totalBreakTimeFormatted}.${penaltyMessage ? ` (${penaltyMessage})` : ''}`);
      setResultColorClass('bg-red-100 text-red-800'); // Set message background color to red
    } else {
      setResult(`You have met or exceeded the 8-hour work requirement by ${formatTime(-remainingTimeSeconds)}, Break time: ${totalBreakTimeFormatted}.${penaltyMessage ? ` (${penaltyMessage})` : ''}`);
      setResultColorClass('bg-green-100 text-green-800'); // Set message background color to green
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cyan-200">
      <div className="container mx-auto p-6 bg-cyan-100 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Work Time Calculator</h1>
        <div className="text-center mb-4">
          <p>Current Time: <span className="font-semibold">{currentTime}</span></p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculateWorkTime();
          }}
          className="flex flex-col items-center"
        >
          <div className="max-w-lg w-full">
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="loginTime" className="text-gray-700 text-sm font-bold">Login Time (HH:MM:SS)</label>
              <input
                id="loginTime"
                className="input-field text-right"
                type="time"
                value={loginTime}
                onChange={(e) => setLoginTime(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="logoutTime" className="text-gray-700 text-sm font-bold">Expected Logout Time (HH:MM:SS)</label>
              <input
                id="logoutTime"
                className="input-field text-right"
                type="time"
                value={logoutTime}
                onChange={(e) => setLogoutTime(e.target.value)}
                required
              />
            </div>

            {/* Break Intervals */}
            {breaks.map((breakTime, index) => (
              <div key={index} className="mb-4 flex items-center justify-between space-x-4">
                <div>
                  <label htmlFor={`breakOut-${index}`} className="text-gray-700 text-sm font-bold">Break Out Time (HH:MM:SS)</label>
                  <input
                    id={`breakOut-${index}`}
                    className="input-field text-right"
                    type="time"
                    value={breakTime.breakOut}
                    onChange={(e) => {
                      const newBreaks = [...breaks];
                      newBreaks[index].breakOut = e.target.value;
                      setBreaks(newBreaks);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor={`breakIn-${index}`} className="text-gray-700 text-sm font-bold">Break In Time (HH:MM:SS)</label>
                  <input
                    id={`breakIn-${index}`}
                    className="input-field text-right"
                    type="time"
                    value={breakTime.breakIn}
                    onChange={(e) => {
                      const newBreaks = [...breaks];
                      newBreaks[index].breakIn = e.target.value;
                      setBreaks(newBreaks);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBreak(index)}
                  className="btn bg-red-500 text-white py-1 px-4 rounded-full mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBreak}
              className="btn bg-green-500 text-white py-2 px-4 rounded-full mt-4"
            >
              Add Break
            </button>
          </div>
          <button
            type="submit"
            className="btn bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-full mt-4 transition duration-300"
          >
            Calculate
          </button>
        </form>

        {result && (
          <div className={`result mt-8 py-4 px-6 rounded-lg font-semibold ${resultColorClass}`}>
            {result.split('.').map((line, index) => (
              <p key={index} className="inline-block">{line.trim()}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
