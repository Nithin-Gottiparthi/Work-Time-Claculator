import React, { useState } from 'react';

function App() {
  const [loginTime, setLoginTime] = useState('');
  const [logoutTime, setLogoutTime] = useState('');
  const [lunchOutTime, setLunchOutTime] = useState('');
  const [lunchInTime, setLunchInTime] = useState('');
  const [result, setResult] = useState(null);
  const [resultColorClass, setResultColorClass] = useState('');

  const parseTime = (time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return new Date(1970, 0, 1, hours, minutes, seconds);
  };

  const formatTime = (seconds) => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = Math.floor(absSeconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const calculateWorkTime = () => {
    if (!loginTime || !logoutTime) {
      setResult('Please enter login and logout times.');
      setResultColorClass('');
      return;
    }

    const login = parseTime(loginTime);
    const logout = parseTime(logoutTime);
    const lunchOut = lunchOutTime ? parseTime(lunchOutTime) : null;
    const lunchIn = lunchInTime ? parseTime(lunchInTime) : null;

    const penaltyThreshold = parseTime('09:15:00');

    let penaltyMessage = '';

    if (login >= logout) {
      setResult('Logout time must be after login time.');
      setResultColorClass('');
      return;
    }

    if (lunchOut && lunchIn && (lunchOut >= lunchIn || lunchOut < login || lunchIn > logout)) {
      setResult('Invalid lunch break times.');
      setResultColorClass('');
      return;
    }

    if (login > penaltyThreshold) {
      penaltyMessage = 'You have occurred a penalty for not being on time.';
    }

    const workDurationSeconds = (logout - login) / 1000; // in seconds
    const lunchDurationSeconds = lunchOut && lunchIn ? (lunchIn - lunchOut) / 1000 : 0; // in seconds
    const effectiveWorkDurationSeconds = workDurationSeconds - lunchDurationSeconds;

    const requiredWorkDurationSeconds = 8 * 3600; // 8 hours in seconds
    const remainingTimeSeconds = requiredWorkDurationSeconds - effectiveWorkDurationSeconds;

    if (remainingTimeSeconds > 0) {
      setResult(`You need to work for ${formatTime(remainingTimeSeconds)} more to complete the 8-hour requirement.${penaltyMessage ? ` (${penaltyMessage})` : '.'}`);
      setResultColorClass('bg-red-100 text-red-800'); // Set message background color to red
    } else {
      setResult(`You have met or exceeded the 8-hour work requirement by ${formatTime(-remainingTimeSeconds)}.${penaltyMessage ? ` (${penaltyMessage})` : ''}`);
      setResultColorClass('bg-green-100 text-green-800'); // Set message background color to green
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cyan-200">
      <div className="container mx-auto p-6 bg-cyan-100 rounded-lg shadow-lg ">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Work Time Calculator</h1>
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
                step="1"
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
                step="1"
                value={logoutTime}
                onChange={(e) => setLogoutTime(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="lunchOutTime" className="text-gray-700 text-sm font-bold">Lunch Break Out Time (HH:MM:SS)</label>
              <input
                id="lunchOutTime"
                className="input-field text-right"
                type="time"
                step="1"
                value={lunchOutTime}
                onChange={(e) => setLunchOutTime(e.target.value)}
              />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="lunchInTime" className="text-gray-700 text-sm font-bold">Lunch Break In Time (HH:MM:SS)</label>
              <input
                id="lunchInTime"
                className="input-field text-right"
                type="time"
                step="1"
                value={lunchInTime}
                onChange={(e) => setLunchInTime(e.target.value)}
              />
            </div>
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
