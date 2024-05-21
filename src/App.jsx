import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((pre) => pre + 1);
    setCount((pre) => pre + 1);
  };

  return (
    <>
      <div>{count}</div>
      <button onClick={handleClick}>更新</button>
    </>
  );
}

export default App;
