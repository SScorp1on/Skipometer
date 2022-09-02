import React, {useEffect, useRef, useState} from 'react';
import './ControlPanel.css';
import {numberToTime} from '../../misc/numberToTime';
import {timeToNumber} from '../../misc/timeToNumber';
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
    Badge,
    Input, RingProgress, Text, SegmentedControl,
    Paper, ThemeIcon, Progress, createStyles, Switch
} from "@mantine/core";
import {CalendarTime, Clock, PlayerPause, PlayerPlay, Refresh} from "tabler-icons-react";

enum states {
    STOP, RUNNING, PAUSE, TIMEOUT, SKIPPED
}
const ICON_SIZE = 60;
const useStyles = createStyles((theme) => ({
    card: {
        position: 'relative',
        overflow: 'visible',
        padding: theme.spacing.xl,
        paddingTop: theme.spacing.xl * 1.5 + ICON_SIZE / 3,
    },

    icon: {
        position: 'absolute',
        top: -ICON_SIZE / 3,
        left: `calc(50% - ${ICON_SIZE / 2}px)`,
    },

    title: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        lineHeight: 1,
    },
}));
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
          skip: false
      }],
      startTime: null,
      timeLeft: 0,
      pauses: [],
      timer: null,
  });
    const ws = useRef(webSocket);
    const { classes } = useStyles();

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
            return () => ws.current.close();
    } , [ws]);
 const updateSkipometer = (calback: any) => {
    calback(skipometer);
    setSkipometer({ ...skipometer });
  }
  const updateEnableTimer = (value: boolean) => {
     setSkipometer({ ...skipometer, enableTimer: value });
  }

  const changeTime = (deltaTime: number) => {
    const newTime = timeToNumber(skipometer.initialTimeLeft) + deltaTime;

    if (newTime >= 0) {
        console.log(skipometer.startVotingTime)
        console.log(skipometer)
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
              {/*<Paper radius="md" withBorder className={classes.card} mt={ICON_SIZE / 3}>
                  <ThemeIcon className={classes.icon} size={ICON_SIZE} radius={ICON_SIZE}>
                      <Clock size={34} />
                  </ThemeIcon>

                  <Text align="center" weight={700} className={classes.title}>
                      {skipometer.caption}
                  </Text>


                  <Group position="center" mt="xs">
                      <Text size="sm" color="dimmed">
                          {numberToTime(skipometer.timeLeft)} {(skipometer.votes.filter((el) => el.skip).length)}
                          {(skipometer.votes.filter((el) => !el.skip).length)}
                      </Text>
                  </Group>
                  <Progress value={100 * skipometer.timeLeft / 3600000}
                            color={skipometer.state === states.RUNNING ? 'green' : skipometer.state === states.PAUSE ? 'yellow' : 'red'}  mt={5} />
                  <Progress sections={[{value: (skipometer.votes.filter((el) => el.skip).length) ,
                      color: 'red'}, {value: (skipometer.votes.filter((el) => !el.skip).length), color: 'green'}]} mt={5} />
                  <Group position="center" mt="md">
                      <Text size="sm">{skipometer.currentSkipNumber}/{skipometer.skipNumber}</Text>
                  </Group>
              </Paper>*/}
          </div>
        <Title className="control-panel__header">Панель управления</Title>
        <form className="control-panel__form">
            <Stack>
            <TextInput
                label={'Заголовок'}
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
              value={skipometer.initialTimeLeft}
              onChange={(event: any) => {
                  skipometer.initialTimeLeft = event.target.value;
                  setSkipometer({...skipometer});
                  sendStateToWSS();
              }
              }
              disabled={
                skipometer.state === states.RUNNING ||
                !skipometer.enableTimer
              }
            />
                </Input.Wrapper>
            <SimpleGrid cols={3} >
              <Button
                onClick={() => {
                  changeTime(60 * 1000);
                }}
                disabled={ skipometer.state === states.RUNNING}
              >+1 мин</Button>
              <Button
                onClick={() => {
                  changeTime(600 * 1000);
                }}
                disabled={ skipometer.state === states.RUNNING}
              >+10 мин</Button>
              <Button
                onClick={() => {
                 changeTime(60 * 60 * 1000);
                }}
                disabled={ skipometer.state === states.RUNNING}
              >+1 час</Button>
              <Button
                onClick={() => {
                  changeTime(-60 * 1000);
                }}
                disabled={ skipometer.state === states.RUNNING}
              >-1 мин</Button>
              <Button
                onClick={() => {
                  changeTime(-600 * 1000);
                }}
                disabled={ skipometer.state === states.RUNNING}
              >-10 мин</Button>
              <Button
                onClick={() => {
                  changeTime(-60 * 60 * 1000);
                }}
                disabled={ skipometer.state === states.RUNNING}
              >-1 час</Button>
            </SimpleGrid>
                <Input.Wrapper label={'Тир саба'}>
                <SegmentedControl fullWidth
                                  disabled={ skipometer.state === states.RUNNING}
                    data={[
                        { value: '00:30:00', label: 'Саб' },
                        { value: '00:15:00', label: 'Мега саб' },
                        { value: '00:00:00', label: 'ГИГА саб' },
                    ]}
                    onChange={(value) => {
                        skipometer.startVotingTime = value;
                        setSkipometer({...skipometer})
                        sendStateToWSS();
                    }}
                />
                </Input.Wrapper>
            <Input.Wrapper label={'Начало голосования'}>
            <Input
              id="startVotingTime"
              type="time"
              step="2"
              value={skipometer.startVotingTime}
              disabled={
                skipometer.state === states.RUNNING ||
                skipometer.state === states.PAUSE ||
                !skipometer.enableTimer
              }
              onChange={(event : any) => {
                  skipometer.startVotingTime = event.target.value;
                  setSkipometer({...skipometer});
                  sendStateToWSS();
              }}
            />
            </Input.Wrapper>
            <NumberInput
                label={'Количество скипов'}
              id="skipNumber"
              min={1}
                disabled={skipometer.state === states.RUNNING}
              value={skipometer.skipNumber}
              defaultValue={skipometer.skipNumber}
                onChange={(value) => {
                    setSkipometer({...skipometer, skipNumber: value!})
                }}
            />
            <Checkbox
              id="allowRevote"
              label={'Возможность переголосовать'}
              checked={skipometer.allowRevote}
              onChange={(value) => {
                  setSkipometer({...skipometer, allowRevote: value.currentTarget.checked})
                  ws.current.send(JSON.stringify({...skipometer, allowRevote: value.currentTarget.checked}));
              }}
            />
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
