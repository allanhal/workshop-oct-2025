import "./App.css";
import Webcam from "react-webcam";
import axios from "axios";
import { useState } from "react";
import { GridLoader } from "react-spinners";

function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const videoConstraints = {
    facingMode: "user",
  };
  return (
    <>
      <Webcam
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      >
        {({ getScreenshot }) => (
          <button
            disabled={loading}
            onClick={() => {
              const sendImage = async () => {
                const image = getScreenshot();
                try {
                  setLoading(true);
                  const API = "http://localhost:8080";
                  const res = await axios.post(`${API}/calvo`, {
                    image,
                  });
                  setResult(res.data);
                } catch (err) {
                  console.log(err);
                } finally {
                  setLoading(false);
                }
              };

              sendImage();
            }}
          >
            Sou calvo(a)?
          </button>
        )}
      </Webcam>
      <div style={{ padding: "0 50px" }}>
        {loading ? <GridLoader color="#535bf2" /> : <span>{result}</span>}
      </div>
    </>
  );
}

export default App;
