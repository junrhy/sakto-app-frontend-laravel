import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import axios from 'axios';
import { Clock, Pause, Play, RotateCcw, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TimerStatus {
    participant_id: number;
    is_running: boolean;
    has_started: boolean;
    elapsed_time_seconds: number;
    formatted_time: string;
    timer_started_at: string | null;
    timer_ended_at: string | null;
}

interface ParticipantTimerProps {
    challengeId: number;
    participantId: number;
    participantName: string;
    onTimerUpdate?: (status: TimerStatus) => void;
}

export default function ParticipantTimer({
    challengeId,
    participantId,
    participantName,
    onTimerUpdate,
}: ParticipantTimerProps) {
    const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [displayTime, setDisplayTime] = useState('00:00:00');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch initial timer status
    const fetchTimerStatus = useCallback(async () => {
        try {
            setIsInitialLoading(true);
            console.log(
                'Fetching timer status for participant:',
                participantId,
            );
            const response = await axios.get(
                `/challenges/${challengeId}/timer/${participantId}/status`,
            );
            const status = response.data;
            console.log('Timer status received:', status);

            setTimerStatus(status);

            // Use the actual formatted time from the backend
            if (status.formatted_time) {
                console.log(
                    'Using backend formatted time:',
                    status.formatted_time,
                );
                setDisplayTime(status.formatted_time);
            } else {
                // Fallback: format the elapsed time ourselves
                const hours = Math.floor(status.elapsed_time_seconds / 3600);
                const minutes = Math.floor(
                    (status.elapsed_time_seconds % 3600) / 60,
                );
                const seconds = status.elapsed_time_seconds % 60;
                const fallbackTime = formatTime(hours, minutes, seconds);
                console.log(
                    'Using fallback formatted time:',
                    fallbackTime,
                    'from elapsed seconds:',
                    status.elapsed_time_seconds,
                );
                setDisplayTime(fallbackTime);
            }

            // Start interval if timer is running
            if (status.is_running) {
                console.log(
                    'Timer is running, starting display timer with elapsed seconds:',
                    status.elapsed_time_seconds,
                );
                startDisplayTimer(status.elapsed_time_seconds);
            }

            onTimerUpdate?.(status);
        } catch (error) {
            console.error('Failed to fetch timer status:', error);
        } finally {
            setIsInitialLoading(false);
        }
    }, [challengeId, participantId, onTimerUpdate]);

    // Start display timer for real-time updates
    const startDisplayTimer = useCallback((initialSeconds: number) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Ensure initialSeconds is not negative
        const safeInitialSeconds = Math.max(0, initialSeconds);
        const startTime = Date.now() - safeInitialSeconds * 1000;

        // Set initial display immediately
        const initialHours = Math.floor(safeInitialSeconds / 3600);
        const initialMinutes = Math.floor((safeInitialSeconds % 3600) / 60);
        const initialSecondsRemaining = safeInitialSeconds % 60;
        setDisplayTime(
            formatTime(initialHours, initialMinutes, initialSecondsRemaining),
        );

        const interval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(elapsedSeconds / 3600);
            const minutes = Math.floor((elapsedSeconds % 3600) / 60);
            const seconds = elapsedSeconds % 60;
            setDisplayTime(formatTime(hours, minutes, seconds));
        }, 1000);

        intervalRef.current = interval;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Stop display timer
    const stopDisplayTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Helper function for time formatting
    const formatTime = (hours: number, minutes: number, seconds: number) => {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Timer control functions
    const startTimer = async () => {
        setIsLoading(true);
        try {
            await axios.post(`/challenges/${challengeId}/timer/start`, {
                participant_id: participantId,
            });

            // Get the updated timer status after starting
            const statusResponse = await axios.get(
                `/challenges/${challengeId}/timer/${participantId}/status`,
            );
            const status = statusResponse.data;

            setTimerStatus(status);
            setDisplayTime(status.formatted_time);

            if (status.is_running) {
                startDisplayTimer(status.elapsed_time_seconds);
            }

            onTimerUpdate?.(status);
        } catch (error) {
            console.error('Failed to start timer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const stopTimer = async () => {
        setIsLoading(true);
        try {
            await axios.post(`/challenges/${challengeId}/timer/stop`, {
                participant_id: participantId,
            });

            // Get the updated timer status after stopping
            const statusResponse = await axios.get(
                `/challenges/${challengeId}/timer/${participantId}/status`,
            );
            const status = statusResponse.data;

            setTimerStatus(status);
            stopDisplayTimer();

            // Use the actual formatted time from the backend
            if (status.formatted_time) {
                setDisplayTime(status.formatted_time);
            } else {
                // Fallback: format the elapsed time ourselves
                const hours = Math.floor(status.elapsed_time_seconds / 3600);
                const minutes = Math.floor(
                    (status.elapsed_time_seconds % 3600) / 60,
                );
                const seconds = status.elapsed_time_seconds % 60;
                setDisplayTime(formatTime(hours, minutes, seconds));
            }

            onTimerUpdate?.(status);
        } catch (error) {
            console.error('Failed to stop timer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pauseTimer = async () => {
        setIsLoading(true);
        try {
            await axios.post(`/challenges/${challengeId}/timer/pause`, {
                participant_id: participantId,
            });

            // Get the updated timer status after pausing
            const statusResponse = await axios.get(
                `/challenges/${challengeId}/timer/${participantId}/status`,
            );
            const status = statusResponse.data;

            setTimerStatus(status);
            stopDisplayTimer();

            // Use the actual formatted time from the backend
            if (status.formatted_time) {
                setDisplayTime(status.formatted_time);
            } else {
                // Fallback: format the elapsed time ourselves
                const hours = Math.floor(status.elapsed_time_seconds / 3600);
                const minutes = Math.floor(
                    (status.elapsed_time_seconds % 3600) / 60,
                );
                const seconds = status.elapsed_time_seconds % 60;
                setDisplayTime(formatTime(hours, minutes, seconds));
            }

            onTimerUpdate?.(status);
        } catch (error) {
            console.error('Failed to pause timer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resumeTimer = async () => {
        setIsLoading(true);
        try {
            await axios.post(`/challenges/${challengeId}/timer/resume`, {
                participant_id: participantId,
            });

            // Get the updated timer status after resuming
            const statusResponse = await axios.get(
                `/challenges/${challengeId}/timer/${participantId}/status`,
            );
            const status = statusResponse.data;

            setTimerStatus(status);
            setDisplayTime(status.formatted_time);

            if (status.is_running) {
                startDisplayTimer(status.elapsed_time_seconds);
            }

            onTimerUpdate?.(status);
        } catch (error) {
            console.error('Failed to resume timer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetTimer = async () => {
        setIsLoading(true);
        try {
            await axios.post(`/challenges/${challengeId}/timer/reset`, {
                participant_id: participantId,
            });

            // Get the updated timer status after resetting
            const statusResponse = await axios.get(
                `/challenges/${challengeId}/timer/${participantId}/status`,
            );
            const status = statusResponse.data;

            setTimerStatus(status);
            stopDisplayTimer();
            setDisplayTime(status.formatted_time);
            onTimerUpdate?.(status);
        } catch (error) {
            console.error('Failed to reset timer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch timer status on component mount
    useEffect(() => {
        fetchTimerStatus();

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchTimerStatus]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {participantName}'s Timer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6 text-center">
                    <div className="font-mono text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {isInitialLoading ? 'Loading...' : displayTime}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {isInitialLoading
                            ? 'Loading timer status...'
                            : timerStatus?.is_running
                              ? 'Running'
                              : timerStatus?.has_started
                                ? 'Paused'
                                : 'Not Started'}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {!timerStatus?.has_started ? (
                        <Button
                            onClick={startTimer}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Start
                        </Button>
                    ) : timerStatus?.is_running ? (
                        <>
                            <Button
                                onClick={pauseTimer}
                                disabled={isLoading}
                                variant="outline"
                            >
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                            </Button>
                            <Button
                                onClick={stopTimer}
                                disabled={isLoading}
                                variant="destructive"
                            >
                                <Square className="mr-2 h-4 w-4" />
                                Stop
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={resumeTimer}
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                            </Button>
                            <Button
                                onClick={resetTimer}
                                disabled={isLoading}
                                variant="outline"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </>
                    )}
                </div>

                {timerStatus?.has_started && (
                    <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                        {timerStatus.timer_started_at && (
                            <div>
                                Started:{' '}
                                {new Date(
                                    timerStatus.timer_started_at,
                                ).toLocaleString()}
                            </div>
                        )}
                        {timerStatus.timer_ended_at && (
                            <div>
                                Ended:{' '}
                                {new Date(
                                    timerStatus.timer_ended_at,
                                ).toLocaleString()}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
