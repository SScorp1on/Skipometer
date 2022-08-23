import React, {useEffect, useRef, useState} from 'react';
import './ControlPanel.css';
import numberToTime from '../../misc/numberToTime';
import timeToNumber from '../../misc/timeToNumber';
import {
    Checkbox,
    Group,
    MantineProvider,
    NumberInput,
    Stack,
    TextInput,
    Title,
    Button,
    SimpleGrid,
    Slider,
    Badge,
    Input, Indicator, RingProgress, Text, Timeline, TimelineItem
} from "@mantine/core";
import {PlayerPause, PlayerPlay, Refresh} from "tabler-icons-react";

/*const DeltaTimeWrap = `
  display: flex;
  justify-content: center;
  align-items: center;
  & input {
    width: 110px;
  }
`;*/
enum states {
    STOP, RUNNING, PAUSE, TIMEOUT, SKIPPED
}
const webSocket = new WebSocket('ws://localhost:5000');
const  ControlPanel = () => {
  const [skipometer, setSkipometer] = useState({
      caption: '',
      enableTimer: false,
      initialTimeLeft: '',
      startVotingTime: '',
      skipNumber: 0,
      allowRevote: false,
      currentSkipNumber: 0,
      saveValue: 1,
      previousState: states.STOP,
      state: states.STOP,
      voting: false,
      votes: [{
          nickname: '',
          skip: ''
      }],
      startTime: null,
      timeLeft: 0,
      pauses: [],
      timer: null,
  });
    const ws = useRef(webSocket);

    useEffect(() => {
            ws.current.onopen = () => {
                console.log('connected');
            }
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setSkipometer((prevState) =>
                    ({
                        ...prevState,
                        caption: data.caption,
                    enableTimer: data.enableTimer,
                    initialTimeLeft: data.initialTimeLeft,
                    startVotingTime: data.startVotingTime,
                    skipNumber: data.skipNumber,
                    allowRevote: data.allowRevote,
                    currentSkipNumber: data.currentSkipNumber,
                    saveValue: data.saveValue,
                    previousState: data.previousState,
                    state: data.state,
                    voting: data.voting,
                    votes: data.votes,
                    startTime: data.startTime,
                    timeLeft: data.timeLeft,
                    pauses: data.pauses,
                    timer: data.timer

                }));
            }
            return () => ws.current?.close();
    } , []);

 const updateSkipometer = (calback: any) => {
    calback(skipometer);
    setSkipometer({ ...skipometer });
  }
  const updateEnableTimer = (value: boolean) => {
     setSkipometer({ ...skipometer, enableTimer: value });
  }

  const changeTime = (deltaTime: any) => {
    const newTime = timeToNumber(skipometer.initialTimeLeft) + deltaTime;

    if (newTime >= 0) {
      skipometer.initialTimeLeft = numberToTime(newTime);
      setSkipometer({ ...skipometer });
      sendStateToWSS();
    }
  }

  const sendStateToWSS = () => {
         ws.current.send(JSON.stringify(skipometer));
  }
    return (
        <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <div className="control-panel">
          <div id="skipometer">
        <Button
          onClick={() => {
            window.open('/Skipometer');
          }}
        >
          Скипометр
        </Button>
              <RingProgress hidden={skipometer.state === states.STOP} label={
                  <Text size={'xs'} align={'center'}>
                      {numberToTime(skipometer.timeLeft)}
                  </Text>} sections={[{value: 100* skipometer.timeLeft / 3600000 ,
                  color: skipometer.state === states.RUNNING ? 'green' : skipometer.state === states.PAUSE ? 'yellow' : 'red'}]} />
          </div>
        <Title className="control-panel__header">Панель управления</Title>
        <form className="control-panel__form">
            <Stack>
            <TextInput
                label={'Название'}
              id="caption"
              defaultValue={skipometer.caption}
                onChange={(e) => {
                    setSkipometer({...skipometer, caption: e.target.value})
                }}
            />
            <Checkbox
                label={'Включить таймер'}
              id="enableTimer"
              checked={skipometer.enableTimer}
              onChange={(event) =>{
                  updateEnableTimer(event.target.checked)
                  ws.current.send(JSON.stringify({...skipometer, enableTimer: event.target.checked}));

             }
              }
              disabled={
                skipometer.state === states.RUNNING ||
                skipometer.state === states.PAUSE
              }
            />
                <Input.Wrapper  label={'Начальное время'}>
            <Input
              id="initialTimeLeft"
              type="time"
              step="2"
              defaultValue={skipometer.initialTimeLeft}
              disabled={
                skipometer.state === states.RUNNING ||
                skipometer.state === states.PAUSE ||
                !skipometer.enableTimer
              }
            />
                </Input.Wrapper>
            <SimpleGrid cols={3} >
              <Button
               // caption="+1 min"
                onClick={() => {
                  changeTime(60 * 1000);
                }}
              >+1 мин</Button>
              <Button
               // caption="+10 min"
                onClick={() => {
                  changeTime(600 * 1000);
                }}
              >+10 мин</Button>
              <Button
                  // "+1 hour"
                onClick={() => {
                 changeTime(60 * 60 * 1000);
                }}
              >+1 час</Button>
              <Button
               // caption="-1 min"
                onClick={() => {
                  changeTime(-60 * 1000);
                }}
              >-1 мин</Button>
              <Button
               // caption="-10 min"
                onClick={() => {
                  changeTime(-600 * 1000);
                }}
              >-10 мин</Button>
              <Button
                // caption="-1 hour"
                onClick={() => {
                  changeTime(-60 * 60 * 1000);
                }}
              >-1 час</Button>
            </SimpleGrid>

            <Input.Wrapper label={'Начало голосования'}>
            <Input
              id="startVotingTime"
              type="time"
              step="2"
              defaultValue={skipometer.startVotingTime}
              disabled={
                skipometer.state === states.RUNNING ||
                skipometer.state === states.PAUSE ||
                !skipometer.enableTimer
              }
            />
            </Input.Wrapper>
            <NumberInput
                label={'Количество скипов'}
              id="skipNumber"
              min={1}
              value={skipometer.skipNumber}
              defaultValue={skipometer.skipNumber}
                onChange={(value) => {
                    setSkipometer({...skipometer, skipNumber: value!})
                }}
            />
            <Checkbox
              id="allowRevote"
              label={'Возможность переголосовать'}
              defaultChecked={skipometer.allowRevote}
              onInput={() => {
                sendStateToWSS();
              }}
            />
          {/*  <Slider
                label={`Save value: ${skipometer.saveValue}`}
              id="saveValue"
              min={0}
              max={1}
              step={0.5}
                value={skipometer.saveValue}
              disabled={
                skipometer.state === states.RUNNING ||
                skipometer.state === states.PAUSE
              }
              onChange={(value) => {
                setSkipometer({ ...skipometer, saveValue: value });
              }}
            />*/}
                <Group position={'apart'}>
            <Button
                leftIcon={<PlayerPlay size={20}/>}
                color={'green'}
              hidden={skipometer.state === states.RUNNING}
              onClick={() => {
                  setSkipometer({
                        ...skipometer, state: states.RUNNING,
                  });
                updateSkipometer((skipometer: any) => {
                  skipometer.state = states.RUNNING;
                });
                sendStateToWSS();
              }}
            >Старт</Button>
            <Button
                color={'yellow'}
                leftIcon={<PlayerPause size={20}/>}
              hidden={
               skipometer.state !== states.RUNNING ||
                !skipometer.enableTimer
              }
              onClick={() => {
                updateSkipometer((skipometer: any) => {
                  skipometer.state = states.PAUSE;
                });
                sendStateToWSS();
              }}
            >Пауза</Button>
            <Button
                leftIcon={<Refresh size={20}/>}
                color={'red'}
              onClick={() => {
                updateSkipometer((skipometer: any) => {
                  skipometer.state = states.STOP;
                });
                sendStateToWSS();
              }}
            >Сбросить</Button>
            </Group>
            </Stack>
        </form>
        <div className="logs">
          {skipometer.votes.map((vote, index) => (
            <Badge
                size={'xl'}
                variant={'filled'}
              key={'vote#' + index}
              color={
                (vote.skip ? 'red' : 'green')
              }
            >{`${vote.nickname}: ${
              vote.skip ? 'skip +1' : 'save -' + skipometer.saveValue
            }`}</Badge>
          ))}
        </div>
      </div>
        </MantineProvider>
    )
}

export default ControlPanel;
