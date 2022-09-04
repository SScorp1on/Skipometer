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
    Input,
    RingProgress,
    Text,
    SegmentedControl,
    createStyles,
    ActionIcon, NumberInputHandlers, Transition
} from "@mantine/core";
import {Minus, PlayerPause, PlayerPlay, Plus, Refresh} from "tabler-icons-react";
interface ISkipometer {
    caption: string,
    enableTimer: boolean,
    initialTimeLeft: string,
    startVotingTime: string,
    skipNumber: number,
    allowRevote: boolean,
    currentSkipNumber: number,
    saveValue: number,
    previousState: states,
    state: states,
    voting: boolean,
    votes: [{
        nickname: string,
        skip: boolean
    }],
    startTime: null,
    timeLeft: number,
    pauses: [],
    timer: null,
}
enum states {
    STOP, RUNNING, PAUSE, TIMEOUT, SKIPPED
}
const useStyles = createStyles((theme) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `6px ${theme.spacing.xs}px`,
        borderRadius: theme.radius.sm,
        border: '1px solid transparent',
        backgroundColor: theme.colors.dark[5],

        '&:focus-within': {
            borderColor: theme.colors[theme.primaryColor][6],
        },
    },

    control: {
        backgroundColor: theme.colors.dark[7],
        border: '1px solid transparent',

        '&:disabled': {
            borderColor: 'transparent',
            opacity: 0.8,
            backgroundColor: 'transparent',
        },
    },

    input: {
        textAlign: 'center',
        paddingRight: `${theme.spacing.sm}px !important`,
        paddingLeft: `${theme.spacing.sm}px !important`,
        height: 28,
        flex: 1,
    },
}));
const webSocket = new WebSocket('ws://localhost:5000');
const  ControlPanel = () => {
  const [skipometer, setSkipometer] = useState<ISkipometer>({
      caption: '',
      enableTimer: true,
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
    const handlers = useRef<NumberInputHandlers>(null);
    const [opened, setOpened] = useState(false);
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
    sendStateToWSS();
  }

  const changeTime = (deltaTime: number) => {
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
          </div>
        <Title className="control-panel__header">Панель управления</Title>
            <Transition mounted={skipometer.state !== states.RUNNING} transition="fade" duration={500} timingFunction="ease">
                {(styles) =>
                    <div style={styles}>
        <form hidden={skipometer.state === states.RUNNING} className="control-panel__form">
            <Stack>
            <TextInput
                label={'Заголовок'}
              id="caption"
                disabled={skipometer.state === states.RUNNING}
              value={skipometer.caption}
                onChange={(event) => {
                   setSkipometer({...skipometer, caption: event.target.value})
                }}
            />
          {/*  <Checkbox
                label={'Включить таймер'}
              id="enableTimer"
                transitionDuration={300}
              checked={skipometer.enableTimer}
              onChange={(value) =>{
                  updateSkipometer((skipometer: ISkipometer) => {
                      skipometer.enableTimer = value.currentTarget.checked;
                  })
             }
              }
              disabled={
                skipometer.state === states.RUNNING
              }
            />*/}
                <Input.Wrapper  label={'Начальное время'}>
            <Input
              id="initialTimeLeft"
              type="time"
              step="2"
              value={skipometer.initialTimeLeft}
              onChange={(event: any) => {
                  updateSkipometer((skipometer: ISkipometer) => {
                      skipometer.initialTimeLeft = event.target.value;
                  })
              }
              }
              disabled={
                skipometer.state === states.RUNNING
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
                <SegmentedControl
                    fullWidth
                    disabled={ skipometer.state === states.RUNNING}
                    value={skipometer.startVotingTime}
                    transitionDuration={300}
                    data={[
                        { value: '00:30:00', label: 'Саб' },
                        { value: '00:15:00', label: 'Мега саб' },
                        { value: '00:00:00', label: 'ГИГА саб' },
                    ]}
                    onChange={(value) => {
                        updateSkipometer((skipometer : ISkipometer) => {
                            skipometer.startVotingTime = value;
                        })
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
                skipometer.state === states.RUNNING
              }
              onChange={(event : any) => {
                  skipometer.startVotingTime = event.target.value;
                  setSkipometer({...skipometer});
                  sendStateToWSS();
              }}
            />
            </Input.Wrapper>
                <Input.Wrapper label={'Количество скипов'}>
                    <div className={classes.wrapper} >
                    <ActionIcon<'button'>
                        size={28}
                        variant="transparent"
                        onClick={() => handlers.current?.decrement()}
                        disabled={skipometer.skipNumber === 1 || skipometer.state === states.RUNNING}
                        className={classes.control}
                        onMouseDown={(event) => event.preventDefault()}
                    >
                        <Minus size={16} />
                    </ActionIcon>

                    <NumberInput
                        variant="unstyled"
                        min={1}
                        handlersRef={handlers}
                        value={skipometer.skipNumber}
                        onChange={(value) => {
                            value &&
                            ws.current.send(JSON.stringify({...skipometer, skipNumber: value}));
                        }}
                        classNames={{ input: classes.input }}
                    />

                    <ActionIcon<'button'>
                        size={28}
                        variant="transparent"
                        onClick={() => handlers.current?.increment()}
                        className={classes.control}
                        disabled={skipometer.state === states.RUNNING}
                        onMouseDown={(event) => event.preventDefault()}
                    >
                        <Plus size={16} />
                    </ActionIcon>
                    </div>
                </Input.Wrapper>
            <Checkbox
              id="allowRevote"
              label={'Возможность переголосовать'}
              checked={skipometer.allowRevote}
              transitionDuration={300}
              disabled={skipometer.state === states.RUNNING}
              onChange={(value) => {
                  updateSkipometer((skipometer : ISkipometer) => {
                      skipometer.allowRevote = value.currentTarget.checked;
                  })
              }}
            />
                <Group position={'apart'}>
            <Button
                leftIcon={<PlayerPlay size={20}/>}
                color={'green'}
              hidden={skipometer.state === states.RUNNING}
              onClick={() => {
                updateSkipometer((skipometer: ISkipometer) => {
                  skipometer.state = states.RUNNING;
                });
              }}
            >Старт</Button>
            <Button
                color={'yellow'}
                leftIcon={<PlayerPause size={20}/>}
              hidden={
               skipometer.state !== states.RUNNING
              }
              onClick={() => {
                updateSkipometer((skipometer: ISkipometer) => {
                  skipometer.state = states.PAUSE;
                });
              }}
            >Пауза</Button>
            <Button
                leftIcon={<Refresh size={20}/>}
                color={'red'}
              onClick={() => {
                updateSkipometer((skipometer: ISkipometer) => {
                  skipometer.state = states.STOP;
                });
              }}
            >Сбросить</Button>
            </Group>
            </Stack>
        </form></div>}
            </Transition>
          <Transition mounted={skipometer.state === states.RUNNING} transition="fade" duration={500} timingFunction="ease">
              {(styles) => <div style={styles}>
                  <RingProgress size={400} hidden={skipometer.state === states.STOP
                      || skipometer.state === states.TIMEOUT
                  || skipometer.state === states.PAUSE}
                                label={
                                    <Text size={50} align={'center'}>
                                        {numberToTime(skipometer.timeLeft)}
                                    </Text>}
                                roundCaps
                                sections={[{value: 100* skipometer.timeLeft / 3600000 ,
                                    color: skipometer.state === states.RUNNING ? 'green' : skipometer.state === states.PAUSE ? 'yellow' : 'red'}]} />
                  <Group mt={10} position={'apart'}>
                      <Button
                          color={'yellow'}
                          leftIcon={<PlayerPause size={20}/>}
                          hidden={
                              skipometer.state !== states.RUNNING
                          }
                          onClick={() => {
                              updateSkipometer((skipometer: ISkipometer) => {
                                  skipometer.state = states.PAUSE;
                              });
                              setOpened(true);
                          }}
                      >Пауза</Button>
                      <Button
                          leftIcon={<Refresh size={20}/>}
                          color={'red'}
                          hidden={
                              skipometer.state !== states.RUNNING
                          }
                          onClick={() => {
                              updateSkipometer((skipometer: ISkipometer) => {
                                  skipometer.state = states.STOP;
                              });
                              setOpened(true);
                          }}
                      >Сбросить</Button>
                  </Group>
              </div>}
          </Transition>
        <div className="logs" hidden={skipometer.state !== states.RUNNING}>
            <Stack>
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
            </Stack>
        </div>
      </div>
        </MantineProvider>
    )
}

export default ControlPanel;
