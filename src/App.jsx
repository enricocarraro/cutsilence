import React, { useState, useEffect } from 'react';
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [inputAudio, setInputAudio] = useState();
  const [outputAudio, setOutputAudio] = useState();
  const [stopThreshold, setStopThreshold] = useState(-50);

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const cutSilence = async () => {
    const outputName = (-stopThreshold) + "_silenced_" + inputAudio.name;
    ffmpeg.FS('writeFile', inputAudio.name, await fetchFile(inputAudio));

    console.log(`-i ${inputAudio.name} -af silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=${stopThreshold}dB ${outputName}`);
    await ffmpeg.run(
      ...`-i ${inputAudio.name} -af silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=${stopThreshold}dB ${outputName}`.split(
        ' ',
      ),
    );
    const data = ffmpeg.FS('readFile', outputName);
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: 'audio/mpeg' }),
    );
    setOutputAudio(url);
  };

  useEffect(() => {
    load();
  }, []);


  return ready ? (
    <div className="App">
      <content>
        {inputAudio && (
          <audio width="250" controls>
            <source src={URL.createObjectURL(inputAudio)} type="audio/mpeg" />
            <> Your browser does not support the audio element. </>
          </audio>
        )}
        <br />
        <input
          type="file"
          onChange={(e) => setInputAudio(e.target.files?.item(0))}
        />
        <input
          type="number"
          placeholder="Sample value to be treated as silence in dB"
          value={stopThreshold}
          min="-1000"
          max="-1"
          onChange={(e) => setStopThreshold(e.target.value)}
        />
        <button onClick={inputAudio && cutSilence} disabled={!inputAudio}>
          Cut Silence
        </button>
        <h3>Result</h3>
        {outputAudio && (
          <audio width="250" controls>
            <source src={outputAudio} type="audio/mpeg" />
            <> Your browser does not support the audio element. </>
          </audio>
        )}
      </content>
    </div>
  ) : (
    <p> Loading </p>
  );
}

export default App;
