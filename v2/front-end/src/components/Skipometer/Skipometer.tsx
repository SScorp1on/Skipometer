import React, {useEffect, useRef, useState} from 'react';
import './Skipometer.css';
import {numberToTime} from '../../misc/numberToTime';
import {states} from '../../misc/states';
import {Progress, Text, Box, Stack, createStyles, Transition} from "@mantine/core";
const webSocket = new WebSocket('ws://localhost:5000');
const useStyles = createStyles((theme) => ({
    bar: {
        backgroundColor: theme.fn.variant({
            variant: 'outline',
            primaryFallback: false,
        }).background,
    }
}))
const Skipometer = () => {
const {classes} = useStyles();
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

      return () => ws.current.close();
  }, [ws]);

    return (
        <Stack>
            <Box className={'skipometer'}>
            <div className="skipometer__caption">{skipometer.caption}</div>
                <Transition mounted={skipometer.voting || skipometer.state === states.TIMEOUT ||
                    skipometer.state === states.SKIPPED} transition="scale" duration={400} timingFunction="ease">
                    {(styles) =>
        <div
            style={styles}
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
            <div className="skipometer__progress-bar__background"></div>
          <Progress
            radius={'md'}
            className={`skipometer__progress-bar__progress ` + classes.bar}
            value={skipometer.currentSkipNumber? skipometer.currentSkipNumber * 100 / skipometer.skipNumber: 0}
            color={skipometer.state === states.SKIPPED ? 'red' : 'green'}
          />
          {skipometer.currentSkipNumber}/{skipometer.skipNumber}
        </div>}
                </Transition>

        <Text
            weight={500}
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
