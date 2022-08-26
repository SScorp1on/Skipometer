import React, {useEffect, useRef, useState} from 'react';
import './Skipometer.css';
import {numberToTime} from '../../misc/numberToTime';
import {states} from '../../misc/states';
import {Progress, Text, Box, Stack} from "@mantine/core";
const webSocket = new WebSocket('ws://localhost:5000');

const Skipometer = () => {

  const [skipometer, setSkipometer] = useState({
      caption: '',
      enableTimer: false,
      skipNumber: 0,
      currentSkipNumber: 0,
      state: states.STOP,
      voting: false,
      timeLeft: 0,
  });
    const ws = useRef(webSocket);
  useEffect(() => {
      ws.current.onmessage = event => {
      setSkipometer(JSON.parse(event.data));
    };
      return () => ws.current?.close();
  }, []);

    return (
        <Stack>
            <Box className={'skipometer'}>
            <div className="skipometer__caption">{skipometer.caption}</div>
        <div
          className={
            'skipometer__progress-bar' +
            (skipometer.state === states.SKIPPED
              ? ' skipometer__progress-bar--skipped'
              : '')
          }
          hidden={
            !(
              skipometer.voting ||
              skipometer.state === states.TIMEOUT ||
              skipometer.state === states.SKIPPED
            )
          }
        >
          <Progress
            className="skipometer__progress-bar__progress"
            radius={'xl'}
            value={skipometer.currentSkipNumber? skipometer.currentSkipNumber * 100 / skipometer.skipNumber: 0}
            color={skipometer.state === states.SKIPPED ? 'red' : 'green'}
          />
          {skipometer.currentSkipNumber}/{skipometer.skipNumber}
        </div>
          {/*<Progress style={{width: '250px'}} size={'xs'} radius="xl" value={100 * this.state.skipometer.timeLeft / 3600000}/>*/}

        <Text
          className={
            'skipometer__time' +
            (skipometer.state === states.TIMEOUT ||
            skipometer.state === states.SKIPPED
              ? ' skipometer__time--timeout'
              : '')
          }
          hidden={!skipometer.enableTimer}
        >
          {numberToTime(skipometer.timeLeft)}
        </Text>
            </Box>
          </Stack>
    );
}

export default Skipometer;
