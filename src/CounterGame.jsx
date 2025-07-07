import { useReducer, useRef, useCallback, useEffect, useState } from "react";
import "./CounterGame.css";

// Estado inicial del contador y historial
const initialState = { count: 0, history: [] };

// Gestión de actualizaciones del estado según la acción recibida
function reducer(state, action) {
  switch (action.type) {
    case "increment": {
      // Suma un valor al contador y registra el cambio en el historial
      const incrementValue = action.payload || 1;
      const newCount = state.count + incrementValue;
      return {
        count: newCount,
        history: [...state.history, { prevCount: state.count, changeValue: incrementValue, message: `+${incrementValue} (Nuevo valor: ${newCount})` }]
      };
    }
    case "decrement": {
      // Resta un valor al contador y registra el cambio en el historial
      const decrementValue = action.payload || 1;
      const newCount = state.count - decrementValue;
      return {
        count: newCount,
        history: [...state.history, { prevCount: state.count, changeValue: -decrementValue, message: `-${decrementValue} (Nuevo valor: ${newCount})` }]
      };
    }
    case "reset": {
      // Restablece el contador y el historial al estado inicial
      return initialState;
    }
    case "undo": {
      // Revierte el contador al valor anterior y elimina el último cambio del historial
      if (state.history.length > 0) {
        const previousState = state.history[state.history.length - 1];
        return {
          count: previousState.prevCount,
          history: state.history.slice(0, -1)
        };
      }
      return state;
    }
    default:
      // Devuelve el estado sin cambios si la acción no es reconocida
      return state;
  }
}

function CounterGame() {
  // Valor del input para incrementar/decrementar
  const [changeValue, setChangeValue] = useState("1");

  // Gestión del estado del contador y el historial, cargando desde localStorage
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      if (history.length > 0) {
        const lastState = history[history.length - 1];
        return { count: lastState.prevCount + lastState.changeValue, history };
      }
    }
    return initial;
  });

  // Referencia al botón Incrementar para establecer el foco inicial
  const incrementBtnRef = useRef(null);

  // Enfoca el botón Incrementar al construir el componente
  useEffect(() => {
    incrementBtnRef.current.focus();
  }, []);

  // Guarda el historial en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(state.history));
  }, [state.history]);

  // Memoriza la función para incrementar el contador con el valor del input
  const handleIncrement = useCallback(() => {
    const value = parseInt(changeValue, 10);
    if (!isNaN(value) && value > 0) {
      dispatch({ type: "increment", payload: value });
    } else {
      dispatch({ type: "increment" });
    }
  }, [changeValue]);

  // Memoriza la función para decrementar el contador con el valor del input
  const handleDecrement = useCallback(() => {
    const value = parseInt(changeValue, 10);
    if (!isNaN(value) && value > 0) {
      dispatch({ type: "decrement", payload: value });
    } else {
      dispatch({ type: "decrement" });
    }
  }, [changeValue]);

  // Memoriza la función para deshacer la última acción
  const handleUndo = useCallback(() => {
    dispatch({ type: "undo" });
  }, []);

  return (
    <div>
      <h2>Contador: {state.count}</h2>
      <input
        type="number"
        value={changeValue}
        onChange={(e) => setChangeValue(e.target.value)}
        placeholder="Valor a cambiar"
        min="1"
      />
      <button ref={incrementBtnRef} onClick={handleIncrement}>
        Incrementar
      </button>
      <button onClick={handleDecrement}>Decrementar</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      <button onClick={handleUndo}>Deshacer</button>

      <h3>Historial de cambios:</h3>
      <ul>
        {state.history.map((entry, index) => (
          <li key={index}>{entry.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default CounterGame;