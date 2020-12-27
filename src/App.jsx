import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { Button, Container, Row, Col, Spinner, Form } from 'react-bootstrap';
const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [cutting, setCutting] = useState(false);
  const [inputAudio, setInputAudio] = useState();
  const [outputAudio, setOutputAudio] = useState();
  const [stopThreshold, setStopThreshold] = useState(-50);

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const reset = () => {
    setInputAudio();
    setOutputAudio();
    setStopThreshold(-50);
    setCutting(false);
  };

  const cutSilence = async () => {
    setCutting(true);
    const outputName = 'silenced.mp3';
    const inputName = 'tosilence';
    ffmpeg.FS('writeFile', inputName, await fetchFile(inputAudio));

    await ffmpeg.run(
      ...`-i ${inputName} -af silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=${stopThreshold}dB ${outputName}`.split(
        ' ',
      ),
    );
    const data = ffmpeg.FS('readFile', outputName);
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: 'audio/mpeg' }),
    );
    setOutputAudio(url);
    setCutting(false);
  };

  useEffect(() => {
    load();
  }, []);

  const loadingCutButton = (
    <Button variant="primary" disabled>
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
      />{' '}
      Loading...
    </Button>
  );

  return (
    <Container>
      <Row className="d-flex justify-content-center">
        <Col md={6} className="d-flex justify-content-center">
          {ready ? (
            <Row className="d-flex justify-content-center pt-4">
              <Form>
                <img
                  src="logo.svg"
                  width="50%"
                  className="mb-4 rounded mx-auto d-block"
                  alt="Logo"
                />
                <Form.Group controlId="browser">
                  {inputAudio ? (
                    <>
                      <audio width="100%" controls>
                        <source src={URL.createObjectURL(inputAudio)} />
                        <> Your browser does not support the audio element. </>
                      </audio>
                    </>
                  ) : (
                    <Form.File
                      id="custom-file"
                      label="Select a file to cut."
                      custom
                      accept="audio/*"
                      onChange={(e) => setInputAudio(e.target.files?.item(0))}
                    />
                  )}
                </Form.Group>
                <Form.Group controlId="decibelRange">
                  <Form.Label>Silence Threshold (dB)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Sample value to be treated as silence in dB"
                    value={stopThreshold}
                    min="-1000"
                    max="-1"
                    onChange={(e) => setStopThreshold(e.target.value)}
                  />
                </Form.Group>
                {cutting ? (
                  loadingCutButton
                ) : (
                  <Button
                    variant="primary"
                    onClick={cutSilence}
                    disabled={!inputAudio}
                  >
                    Remove silence
                  </Button>
                )}{' '}
                <Button variant="secondary" onClick={reset} disabled={cutting}>
                  Reset
                </Button>
              </Form>
              {outputAudio && (
                <Row className="d-flex justify-content-center pt-4">
                  <Col md={12} className="d-flex justify-content-center pt-4">
                    <h5>Output file:</h5>
                  </Col>
                  <Col md={12} className="d-flex justify-content-center pt-4">
                    <audio width="100%" controls>
                      <source src={outputAudio} />
                      <> Your browser does not support the audio element. </>
                    </audio>{' '}
                  </Col>
                </Row>
              )}
            </Row>
          ) : (
            <Spinner />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
