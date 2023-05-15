import React, { useState } from "react";
import TimeForm from "./TimeForm";
import MadeWithLove from 'react-made-with-love'
import "./App.css";
import {Helmet} from "react-helmet";

function App() {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function getTime(username, year) {
    const month_dict = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July',
      '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    let totalHours = 0;
    let totalMinutes = 0;
    const table = [];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; 
    let endMonth = 12;
    if (year == currentYear) {
      endMonth = currentMonth;
    }

    for (let month = 1; month <= endMonth; month++) {
      const monthString = month.toString().padStart(2, "0");
      const url = `https://api.chess.com/pub/player/${username}/games/${year}/${monthString}`;
      const response = await fetch(url);
      if (response.ok) {
        setIsLoading(true);
        const games = [];
        const response_body = await response.json();
        for (const game of response_body.games) {
          const pgn = game.pgn?.toString();
          if (pgn) {
            const start_time_index = pgn.indexOf('[StartTime');
            const end_time_index = pgn.indexOf('EndTime');
            const start_end_times = pgn.substring(start_time_index, end_time_index + 19);
            games.push(start_end_times);
          }
        }
        const timeDifferences = [];
        for (const entry of games) {
          const startTimeMatch = entry.match(/\[StartTime\s+"(\d\d:\d\d:\d\d)"\]/);
          const endTimeMatch = entry.match(/\[EndTime\s+"(\d\d:\d\d:\d\d)"\]/);
          if (startTimeMatch && endTimeMatch) {
            const startTime = new Date(`1970-01-01T${startTimeMatch[1]}Z`);
            const endTime = new Date(`1970-01-01T${endTimeMatch[1]}Z`);
            if (endTime < startTime) {
              endTime.setDate(endTime.getDate() + 1);
            }
            const timeDifference = (endTime - startTime) / 1000;
            if (timeDifference < 7200) {  
              timeDifferences.push(timeDifference);
            }
          }
          }
          const seconds = timeDifferences.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          totalHours += hours
          totalMinutes += minutes
          table.push({
            month: month_dict[monthString],
            hours: hours,
            minutes: minutes
          });
        } else {
          setIsLoading(false);
          return "Username or date is invalid";
        }
      }
      totalHours += Math.floor(totalMinutes / 60);
      totalMinutes = totalHours % 60;
      setIsLoading(false);

      return (
        <div>
          <p>Hey {username}, you played for {totalHours} hours and {totalMinutes} minutes in {year}</p>
          <table>
            <thead>
              <tr>
                <th className="cellSingle cellSmall">Month</th>
                <th className="cellSingle cellSmall">Time</th>
              </tr>
            </thead>
            <tbody>
              {table.map(row => (
                <tr key={row.id}>
                  <td><div>{row.month}</div></td>
                  <td><div>{row.hours} hours {row.minutes} minutes</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    function handleSubmit(event) {
      setIsLoading(true);
      event.preventDefault();
      const username = document.querySelector("#username").value;
      const date = document.querySelector("#date").value;
      getTime(username, date).then(table => setResult(table));
    }

    return (
      <div className="app-container" style={{ backgroundColor : "light purple" }}>
              <Helmet>
        <title>Chess Time</title>
        <link rel="icon" type="image/png" href="./logo.png" sizes="32x32" />
      </Helmet>

        <div style={{ fontSize: '17px', fontWeight: "thicker", lineHeight: '24px', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" }}>
          <MadeWithLove
            by="Krish Rastogi"
            emoji
            link="http://krishrastogi.com/"
          />
        </div>
        <center>
          <h1 className="h1">Chess Time <span> <h2>Calculate time you have spent on chess.com</h2></span></h1>
          <TimeForm onSubmit={handleSubmit} className="p" />
          <br>
          </br>
          {isLoading ? (
            <div>Loading...(can take up to 30 seconds)</div>
          ) : (
            <div style={{ fontSize: '23px', fontWeight: "thicker", lineHeight: '48px', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" }}>{result}</div>
          )}
        </center>
      </div>
    );
  }

  export default App;
