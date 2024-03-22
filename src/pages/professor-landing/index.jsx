import Agenda from '@/components/Agenda';
import AgendaPagination from '@/components/AgendaPagination';
import Dashboard from '@/components/Dashboard';
import { useUser } from '@/context/UserContext';
import { order_and_group } from '@/utils/order_and_group';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Rating,
    Snackbar,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useWindowSize from '@/hooks/useWindowSize';

// Consts
const dayNumber = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

export default function ProfessorLandingPage() {
    const router = useRouter();
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [orderedSelectedBlocks, setOrderedSelectedBlocks] = useState([]);
    const [week, setWeek] = useState(0);
    const [showConfirmDisable, setShowConfirmationDisable] = useState(false);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('error');
    const [disabledBlocks, setDisabledBlocks] = useState([]);
    const user = useUser();
    const [giveFeedback, setGiveFeedback] = useState(true);
    const [feedback, setFeedback] = useState({ rating: 0, time: false, material: false, kind: false });
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [tab, setTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState('info');
    const [autoHideDuration, setAutoHideDuration] = useState(null);
    const [day, setDay] = useState(1);
    const windowSize = useWindowSize();
    const [nullFeedback, setNullFeedback] = useState(false);

    var curr = new Date();
    var first = curr.getDate() - curr.getDay();

    useEffect(() => {
        setIsLoading(true);
        if (user.id) {
            if (user.role == 'student') router.push('/student-landing');
            if (user.role === 'admin') router.push('/admin-landing');
            const requestOptions = {
                method: 'GET',
                headers: { Authorization: `Bearer ${user.token}` },
            };
            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/reservation/findByProfessor?professorId=${user.id}`, requestOptions).then(res => {
                if (res.status === 200) {
                    res.json().then(json => {
                        setDisabledBlocks(
                            json.map(e => {
                                if (e.day[1] < 10) e.day[1] = '0' + e.day[1];
                                if (e.day[2] < 10) e.day[2] = '0' + e.day[2];
                                if (e.startingHour[0] < 10) e.startingHour[0] = '0' + e.startingHour[0];
                                if (e.startingHour[1] < 10) e.startingHour[1] = '0' + e.startingHour[1];
                                if (e.endingHour[0] < 10) e.endingHour[0] = '0' + e.endingHour[0];
                                if (e.endingHour[1] < 10) e.endingHour[1] = '0' + e.endingHour[1];
                                return e;
                            })
                        );
                    });
                }
                setIsLoading(false);
            });
            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/professor/${user.id}`, requestOptions).then(res => {
                if (res.status === 200) {
                    return res.json().then(json => {
                        json.pendingClassesFeedbacks.map(reservation => {
                            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/reservation/${reservation}`, requestOptions).then(res2 => {
                                res2.json().then(json2 => {
                                    setPendingFeedback(prev => {
                                        let exists = false;
                                        prev.forEach(pfed => {
                                            if (pfed.reservation_id === reservation) exists = true;
                                        });

                                        if (!exists)
                                            return [
                                                ...prev,
                                                {
                                                    reservation_id: reservation,
                                                    receiver: {
                                                        id: json2.student.id,
                                                        name: `${json2.student.firstName} ${json2.student.lastName}`,
                                                    },
                                                },
                                            ];
                                        else return prev;
                                    });
                                });
                            });
                            setGiveFeedback(true);
                        });
                    });
                }
            });
            
        } else {
            router.push('/');
        }
    }, [router, user]);

    const handleCancel = () => {
        setSelectedBlocks([]);
        setShowConfirmationDisable(false);
    };

    const handleConfirmationOpen = () => {
        let orderedSelectedBlocks = order_and_group(selectedBlocks);
        setOrderedSelectedBlocks(orderedSelectedBlocks);
        setShowConfirmationDisable(true);
    };

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleDisable = () => {
        orderedSelectedBlocks.forEach(block => {
            let date = new Date(curr.setDate(first + dayNumber[block.day] + 7 * week)).toLocaleString().split(',')[0];
            let dateElements = date.split('/');
            let bubble = dateElements[0];
            dateElements[0] = dateElements[2];
            dateElements[2] = dateElements[1];
            dateElements[1] = bubble;
            date = dateElements.join('-');

            const reservation = {
                day: date,
                startingHour: block.startingHour,
                endingHour: block.endingHour,
                duration: block.totalHours,
                professorId: parseInt(user.id),
            };

            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/reservation/createUnavailable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    ...reservation,
                }),
            }).then(res => {
                if (res.status !== 200) {
                    setAlertSeverity('error');
                    setAlertMessage('There was an error disabling the block!');
                } else {
                    setDisabledBlocks(prevDisabled => [
                        ...prevDisabled,
                        {
                            day: dateElements,
                            startingHour: block.startingHour.split(':'),
                            endingHour: block.endingHour.split(':'),
                            status: 'NOT_AVAILABLE',
                        },
                    ]);
                }
                setAlert(true);
            });
        });
        handleCancel();
        setAlertSeverity('success');
        setAlertMessage('Block has been disabled successfully!');
    };

    const handleFeedbackNull = () => {
        setFeedback({ rating: 0, time: 0, material: 0, kind: 0 });
        setNullFeedback(false);
        setPendingFeedback(prev => {
            let receiverId = pendingFeedback[0].receiver.id;
            var pfeedbacks = prev.filter(pfed => pfed.receiver.id !== receiverId);
            if (pfeedbacks.length === 0) setGiveFeedback(false);
            else setGiveFeedback(true);
            return pfeedbacks;
        });
        fetch(
            `${process.env.NEXT_PUBLIC_API_URI}/api/professor/removeFeedback/professor=${user.id}&student=${pendingFeedback[0].receiver.id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            }
        )
            .then(res => {
                setFeedbackStatus('success');
            })
            .catch(() => {
                setFeedbackStatus('error');
            })
            .finally(() => {
                setAutoHideDuration(1500);
            });
    };

    const handleFeedback = () => {
        setIsLoadingFeedback(true);
        setFeedbackStatus('info');

        if (nullFeedback) handleFeedbackNull();
        else {
            setFeedback({ rating: 0, time: 0, material: 0, kind: 0 });
            setNullFeedback(false);
            if (pendingFeedback.length === 1) setGiveFeedback(false);
            else setGiveFeedback(true);
            setPendingFeedback(prev => {
                prev.shift();
                return prev;
            });
            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/feedback/giveFeedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    studentId: pendingFeedback[0].receiver.id,
                    professorId: user.id,
                    roleReceptor: 'STUDENT',
                    classId: pendingFeedback[0].reservation_id,
                    rating: feedback.rating,
                    material: feedback.material,
                    punctuality: feedback.time,
                    polite: feedback.kind,
                }),
            })
                .then(res => {
                    setFeedbackStatus('success');
                })
                .catch(() => {
                    setFeedbackStatus('error');
                })
                .finally(() => {
                    setAutoHideDuration(6000);
                });
        }
    };

    const handleFeedbackClick = opt => {
        if (feedback[opt]) {
            setFeedback(prev => ({ ...prev, [opt]: false }));
        } else {
            setFeedback(prev => ({ ...prev, [opt]: true }));
        }
    };

    return (
        <>
            {isLoading ? (
                <>
                    <Box
                        sx={{
                            height: 300,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                </>
            ) : (
                <div style={{ width: '95%', margin: 'auto' }}>
                    <Snackbar
                        open={isLoadingFeedback}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        severity={feedbackStatus}
                        autoHideDuration={autoHideDuration}
                        onClose={() => {
                            setFeedbackStatus('info');
                            setAutoHideDuration(null);
                            setIsLoadingFeedback(false);
                        }}
                    >
                        <Alert severity={feedbackStatus}>
                            {feedbackStatus === 'info'
                                ? 'Sending feedback...'
                                : feedbackStatus === 'success'
                                    ? 'Feedback sent!'
                                    : 'Error sending feedback'}
                        </Alert>
                    </Snackbar>

                    {windowSize.width > 500 && (
                        <Typography variant='h4' sx={{ margin: '2% 0' }}>
                            Hi{' ' + user.firstName + ' ' + user.lastName}, welcome back!
                        </Typography>
                    )}

                    {windowSize.width <= 500 && (
                        <>
                            <Typography variant='h5' sx={{ margin: '2% 0' }} textAlign='center'>
                                Hi{' ' + user.firstName + ' ' + user.lastName}
                            </Typography>
                        </>
                    )}

                    <Tabs value={tab} onChange={handleTabChange}>
                        <Tab label='Agenda' />
                        <Tab label='Dashboard' />
                    </Tabs>
                    <div style={{ paddingBlock: '0.75rem' }} />
                    {tab === 0 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <table style={{ height: '35px' }}>
                                    <tbody>
                                        <tr>
                                            <td
                                                style={{
                                                    width: '130px',
                                                    borderBlock: '1px solid #338aed70',
                                                    backgroundColor: '#338aed90',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Typography>Selected block</Typography>
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'center',
                                                    width: '130px',
                                                    borderBlock: '1px solid #e64b4b70',
                                                    backgroundColor: '#e64b4b90',
                                                }}
                                            >
                                                <Typography>Reserved Class</Typography>
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'center',
                                                    width: '130px',
                                                    borderBlock: '1px solid #adadad70',
                                                    backgroundColor: '#adadad90',
                                                }}
                                            >
                                                <Typography>Unavailable</Typography>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                {windowSize.width > 500 && (
                                    <AgendaPagination week={week} setWeek={setWeek} setSelectedBlocks={setSelectedBlocks} />
                                )}
                            </div>

                            {windowSize.width <= 500 && (
                                <AgendaPagination
                                    week={week}
                                    setWeek={setWeek}
                                    day={day}
                                    setDay={setDay}
                                    setSelectedBlocks={setSelectedBlocks}
                                />
                            )}
                            <Agenda
                                selectedBlocks={selectedBlocks}
                                setSelectedBlocks={setSelectedBlocks}
                                disabledBlocks={disabledBlocks}
                                week={week}
                                day={day}
                                showData
                            />

                            <div style={{ display: 'flex', justifyContent: 'right', margin: '1rem auto', width: '90%' }}>
                                <Button onClick={handleCancel}>Cancel</Button>
                                <Button variant='contained' onClick={handleConfirmationOpen} disabled={selectedBlocks.length === 0}>
                                    Disable
                                </Button>
                            </div>

                            <Dialog open={showConfirmDisable}>
                                <DialogTitle>Confirm Disable</DialogTitle>
                                <DialogContent dividers>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ paddingInline: '2rem' }}>
                                            {orderedSelectedBlocks.map((block, idx) => (
                                                <Typography key={idx}>
                                                    {block.day + ' ' + block.startingHour + ' - ' + block.endingHour}
                                                </Typography>
                                            ))}
                                        </div>
                                    </div>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCancel}>Cancel</Button>
                                    <Button variant='contained' onClick={handleDisable}>
                                        Disable
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            <Snackbar
                                open={alert}
                                autoHideDuration={3000}
                                onClose={() => setAlert(false)}
                                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                            >
                                <Alert severity={alertSeverity}>{alertMessage}</Alert>
                            </Snackbar>
                        </>
                    )}
                    {tab === 1 && <Dashboard id={user.id} />}

                    {pendingFeedback.length > 0 && (
                        <Dialog open={giveFeedback} onClose={() => setGiveFeedback(false)}>
                            <DialogTitle>{`Give Feedback to ${pendingFeedback[0].receiver.name}`}</DialogTitle>
                            <DialogContent>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Rating
                                        precision={0.5}
                                        value={feedback.rating}
                                        onChange={(event, newValue) => {
                                            setFeedback(prev => ({ ...prev, rating: newValue }));
                                        }}
                                        sx={{ fontSize: 42 }}
                                        max={3}
                                        size='large'
                                    />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 10,
                                        marginBlock: '1.5rem',
                                    }}
                                >
                                    <Tooltip title='Is always on time'>
                                        <AccessTimeIcon
                                            fontSize='large'
                                            sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                            onClick={() => handleFeedbackClick('time')}
                                            color={feedback.time ? 'black' : 'disabled'}
                                        />
                                    </Tooltip>

                                    <Tooltip title='Has extra material to practice'>
                                        <InsertDriveFileIcon
                                            fontSize='large'
                                            sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                            onClick={() => handleFeedbackClick('material')}
                                            color={feedback.material ? 'black' : 'disabled'}
                                        />
                                    </Tooltip>

                                    <Tooltip title='Is respectful and patient'>
                                        <SentimentSatisfiedAltIcon
                                            fontSize='large'
                                            sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                            onClick={() => handleFeedbackClick('kind')}
                                            color={feedback.kind ? 'black' : 'disabled'}
                                        />
                                    </Tooltip>
                                </div>

                                <FormControlLabel
                                    label='I dont want to give feedback'
                                    control={<Checkbox checked={nullFeedback} onChange={event => setNullFeedback(event.target.checked)} />}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setGiveFeedback(false)}>Close</Button>
                                <Button variant='contained' onClick={handleFeedback}>
                                    Submit
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}
                </div>
            )}
        </>
    );
}
