// import  * as React from 'react'
import { createRoot } from "react-dom/client";
// import {render} from "react-dom";
import App from "./App.jsx";
// import './index.css'

// 1. 怎么保持状态在恢复的时候
// 2. 怎么数据通信的
// 3. 怎么事件轮询的
const root = createRoot(document.getElementById("root"));
// ReactDOM.render("hi", document.getElementById("root"));
// render(<App />,document.getElementById("root"));
// console.log("root",root);

// const Element = () => {

//   const [test,setTest ] = useState(1);

//   const handleClick = () => {
//    setTest(2)
//   }

//   return <div><span onClick={handleClick}>{test}</span>123</div>
//  }

//  root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )


root.render(<App />);
