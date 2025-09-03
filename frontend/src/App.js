import React, { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get("plans/")
      .then((response) => setPlans(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>Plans</h1>
      <ul>
        {plans.map((plan) => (
          <li key={plan.id}>{plan.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
