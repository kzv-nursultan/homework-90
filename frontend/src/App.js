import React, {useState, useRef, useEffect} from 'react';


const App = () => {
  const [state, setState] = useState({
    mouseDown: false,
    pixelsArray: []
  });

  const canvas = useRef(null);
  const ws = useRef(null);


  const drawLine = data => {
      const context = canvas.current.getContext('2d');
      const imageData = context.createImageData(1, 1);
      const d = imageData.data;
      d[0] = 0;
      d[1] = 0;
      d[2] = 0;
      d[3] = 255;

      data.map(object=>(
        context.putImageData(imageData, object.x, object.y)
      ));
  }

  useEffect(()=>{
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onmessage = event => {
      const decoded = JSON.parse(event.data);

      if (decoded.type === 'NEW_MESSAGE') {
        state.pixelsArray = decoded.data;
        if (state.pixelsArray) {
          drawLine(state.pixelsArray);
        }
      }
    };
  }, []);

  const canvasMouseMoveHandler = event => {
    if (state.mouseDown) {
      const clientX = event.clientX;
      const clientY = event.clientY;

      setState(prevState => {
        return {
          ...prevState,
          pixelsArray: [...prevState.pixelsArray, {
            x: clientX,
            y: clientY
          }]
        };
      });

      const context = canvas.current.getContext('2d');
      const imageData = context.createImageData(10, 1);
      const d = imageData.data;
      d[0] = 0;
      d[1] = 0;
      d[2] = 0;
      d[3] = 255;

      context.putImageData(imageData, event.clientX, event.clientY);
    }
  };

  const mouseDownHandler = () => {
    setState({...state, mouseDown: true});
  };

  const mouseUpHandler = () => {
    if (ws.current.readyState === 1) {
      ws.current.send(JSON.stringify({
        type: 'NEW_COORDINATES',
        data: [...state.pixelsArray],
      }));
      setState({...state, mouseDown: false, pixelsArray: []});
    } else {
      console.error('Connection is not ready');
    }

  };

  return (
    <div style={{display: 'flex'}}>
      <canvas
        ref={canvas}
        style={{border: '1px solid black'}}
        width={800}
        height={600}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
        onMouseMove={canvasMouseMoveHandler}
      />
    </div>
  );
};

export default App;