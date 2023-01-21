import React from "react";
import "./App.css";

function TimeForm(props) {
  return (
    <form className="form">
      <label className="label" htmlFor="username">Username: [chessbrah]</label>
      <input className="input" id="username" name="username" />
      <label className="label" htmlFor="date">Year: [2022]</label>
      <input className="input" type="text" id="date" name="date" />
      <button className="button" onClick={props.onSubmit}>Get Time</button>
    </form>
  );
}

export default TimeForm;