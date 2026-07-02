import React from "react";
import Markup from "./jsx";
import { useResizeDetector } from "react-resize-detector";

const App = () => {
  const { ref } = useResizeDetector();

  return (
    <div ref={ref}>
      <Markup />
    </div>
  );
};

export default App;
