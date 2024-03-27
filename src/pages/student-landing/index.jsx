import Agenda from '@/components/Agenda';
import AgendaPagination from '@/components/AgendaPagination';
import { useUser } from '@/context/UserContext';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Rating,
    Tooltip,
    Typography,
    Box,
    CircularProgress,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Grid,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import useWindowSize from '@/hooks/useWindowSize';
import Calendar from '@/components/Calendar';

export default function StudentLandingPage() {
    const [week, setWeek] = useState(0);
    const [day, setDay] = useState(1);
    const [disabledBlocks, setDisabledBlocks] = useState([]);
    const [giveFeedback, setGiveFeedback] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 0, time: 0, material: 0, kind: 0 });
    const [pendingFeedback, setPendingFeedback] = useState([]);
    const user = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState('info');
    const [autoHideDuration, setAutoHideDuration] = useState(null);
    const [tab, setTab] = useState(1);
    const windowSize = useWindowSize();
    const [events, setEvents] = useState([]);
    const [homeworkDetailsDialog, setHomeworkDetailsDialog] = useState(false);
    const [homeworkDetails, setHomeworkDetails] = useState();
    const [homeworkDeleteDialog, setHomeworkDeleteDialog] = useState(false);
    var router = useRouter();

    const handleHomeworkClick = (event) => {
        setHomeworkDetails(event);
        setHomeworkDetailsDialog(true);
    }

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleDownload = file => {
        const requestOptions = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/file/downloadFile?id=${file.id}`, requestOptions)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement('a');
                a.href = url;
                a.download = file.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error('Error:', error));
    };

    useEffect(() => {
        setIsLoading(true);
        if (user.id && router.isReady) {
            if (user.role == 'professor') router.push('/professor-landing');
            if (user.role === 'admin') router.push('/admin-landing');
            const requestOptions = {
                method: 'GET',
                headers: { Authorization: `Bearer ${user.token}` },
            };
            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/reservation/findByStudent?studentId=${user.id}`, requestOptions).then(res => {
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
            });

            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/student/${user.id}`, requestOptions).then(res => {
                res.json().then(json => {
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
                                                    id: json2.professor.id,
                                                    name: `${json2.professor.firstName} ${json2.professor.lastName}`,
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
            });

            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/events/user/${user.id}`, requestOptions)
                .then(response => {
                    if (response.ok) {
                        return response.json().then(data => {
                            setEvents(data)
                        });
                    }
                }).then(() => {
                    fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/homework/getByStudent/${user.id}`, requestOptions)
                        .then(response => {
                            if (response.ok) {
                                return response.json().then(data => {
                                    data.forEach(item => {
                                        const year = parseInt(item.deadline.split('-')[0]);
                                        const month = parseInt(item.deadline.split('-')[1]);
                                        const day = parseInt(item.deadline.split('-')[2]);
                                        const hour = parseInt(item.deadline.split('T')[1].split(':')[0]);
                                        const minute = parseInt(item.deadline.split('T')[1].split(':')[1]);
                                        item.deadline = [year, month, day, hour, minute];
                                        setEvents(prev => {
                                            const coincidencias = prev.find(e => {
                                                if (e.type === 'HOMEWORK') {
                                                    if (e.endDate[0] == item.deadline[0]
                                                        && e.endDate[1] == item.deadline[1]
                                                        && e.endDate[2] == item.deadline[2]
                                                        && e.endDate[3] == item.deadline[3]
                                                        && e.endDate[4] == item.deadline[4]
                                                        && e.response === item.response
                                                        && e.assignment === item.assignment)
                                                        return e
                                                }
                                            })
                                            if (!coincidencias)
                                                return [
                                                    ...prev, {
                                                        // id: prev.length + 1,
                                                        title: 'Homework',
                                                        description: item.assignment,
                                                        endDate: item.deadline,
                                                        startDate: item.deadline,
                                                        userId: item.studentId,
                                                        type: 'HOMEWORK',
                                                        assignment: item.assignment,
                                                        assignmentFile: item.assignmentFile,
                                                        response: item.response,
                                                        responseFile: item.responseFile,
                                                        status: item.status,
                                                        classReservationId: item.classReservationId,
                                                        professorId: item.professorId
                                                    }]
                                            else return prev
                                        });
                                    })
                                });
                            }
                        })
                        .catch(error => {
                            console.error('There was an error fetching homeworks!', error);
                        });
                })
                .catch(error => {
                    console.error('There was an error!', error);
                });
            setIsLoading(false);
        } else {
            router.push('/');
        }
    }, [user, router]);

    const handleFeedback = () => {
        setIsLoadingFeedback(true);
        setFeedbackStatus('info');
        setFeedback({ rating: 0, time: 0, material: 0, kind: 0 });
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
                studentId: user.id,
                professorId: pendingFeedback[0].receiver.id,
                roleReceptor: 'PROFESSOR',
                classId: pendingFeedback[0].reservation_id,
                rating: feedback.rating,
                material: feedback.material,
                punctuality: feedback.time,
                educated: feedback.kind,
            }),
        })
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

    const handleFeedbackClick = opt => {
        if (feedback[opt] !== 0) {
            setFeedback(prev => ({ ...prev, [opt]: 0 }));
        } else {
            setFeedback(prev => ({ ...prev, [opt]: 1 }));
        }
    };

    return (
        <div style={{ width: '95%', margin: 'auto' }}>
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
                <>
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
                        <>
                            <Typography variant='h4' sx={{ margin: '2% 0' }}>
                                Hi{' ' + user.firstName + ' ' + user.lastName}, welcome back!
                            </Typography>
                            <Typography variant='h4'>Agenda</Typography>
                        </>
                    )}
                    {windowSize.width <= 500 && (
                        <>
                            <Typography variant='h5' sx={{ margin: '2% 0' }} textAlign='center'>
                                Hi{' ' + user.firstName + ' ' + user.lastName}
                            </Typography>
                            <Typography variant='h5' textAlign='center'>
                                Agenda
                            </Typography>
                        </>
                    )}
                    <Tabs value={tab} onChange={handleTabChange} >
                        <Tab label="Agenda" />
                        <Tab label="Calendar" />
                    </Tabs>
                    <Divider />
                    {tab === 0 && (
                        <>
                            <div style={{ paddingBlock: '0.75rem' }} />
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
                                {windowSize.width > 500 && <AgendaPagination week={week} setWeek={setWeek} setSelectedBlocks={() => { }} />}
                            </div>
                            {windowSize.width <= 500 && (
                                <AgendaPagination week={week} setWeek={setWeek} day={day} setDay={setDay} setSelectedBlocks={() => { }} />
                            )}
                            <Agenda
                                selectedBlocks={[]}
                                setSelectedBlocks={() => { }}
                                disabledBlocks={disabledBlocks}
                                week={week}
                                day={day}
                                interactive={false}
                                showData
                            />
                        </>
                    )}
                    {tab === 1 && (
                        <>
                            <Dialog open={homeworkDetailsDialog} onClose={() => setHomeworkDetailsDialog(false)}>
                                <DialogTitle>Homework Details</DialogTitle>
                                <DialogContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant='h6' fontWeight='bold'>Assignment</Typography>
                                            <Typography>{homeworkDetails?.assignment ? homeworkDetails?.assignment : 'Assignment given by uploaded file'}</Typography>
                                        </Grid>
                                        {homeworkDetails?.assignmentFile && (
                                            <>
                                                <Grid item xs={12}>
                                                    <Typography variant='h6' fontWeight='bold'>Assignment File</Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, alignItems: 'center' }}>
                                                        <Typography variant='body2' fontSize={16}>{homeworkDetails?.assignmentFile.fileName}</Typography>
                                                        <Button onClick={() => handleDownload(homeworkDetails.assignmentFile)} >
                                                            <Typography variant='button'>Download Assignment</Typography>
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                                <Divider orientation='horizontal' flexItem />
                                            </>
                                        )}
                                        <Grid item xs={12}>
                                            <Typography variant='h6' fontWeight='bold'>Deadline</Typography>
                                            <Typography>
                                                {homeworkDetails?.endDate[2] < 10 ? '0' + homeworkDetails?.endDate[2] : homeworkDetails?.endDate[2]}
                                                -{homeworkDetails?.endDate[1] < 10 ? '0' + homeworkDetails?.endDate[1] : homeworkDetails?.endDate[1]}
                                                -{homeworkDetails?.endDate[0]} {homeworkDetails?.endDate[3] < 10 ? '0' + homeworkDetails?.endDate[3] : homeworkDetails?.endDate[3]}
                                                :{homeworkDetails?.endDate[4] < 10 ? '0' + homeworkDetails?.endDate[4] : homeworkDetails?.endDate[4]}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant='h6' fontWeight='bold'>Status</Typography>
                                            <Typography sx={{ color: homeworkDetails?.status === 'DONE' ? 'green' : homeworkDetails?.status === 'LATE' ? 'red' : 'orange', }} fontWeight='bold'>{homeworkDetails?.status}</Typography>
                                        </Grid>
                                        {homeworkDetails?.response && (
                                            <Grid item xs={12}>
                                                <Typography variant='h6' fontWeight='bold'>Response</Typography>
                                                <Typography>{homeworkDetails?.response}</Typography>
                                            </Grid>
                                        )}
                                        {homeworkDetails?.responseFile && (
                                            <Grid item xs={12}>
                                                <Typography variant='h6' fontWeight='bold'>Response File</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1, alignItems: 'center' }}>
                                                    <Typography variant='body2' fontSize={16}>{homeworkDetails?.responseFile.fileName}</Typography>
                                                    <Button onClick={() => handleDownload(homeworkDetails.responseFile)} >
                                                        <Typography variant='button'>Download Response</Typography>
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <Typography fontStyle='italic' variant='caption' >
                                                {homeworkDetails?.status === 'PENDING' ?
                                                    'To respond to this homework, refer to the class below'
                                                    : 'For more details regarding this homework, refer to the class below'
                                                }
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => router.push(`/reservation/?id=${homeworkDetails?.classReservationId}&userId=${homeworkDetails?.professorId}`)} >
                                        Go to class
                                    </Button>
                                    <Button onClick={() => setHomeworkDetailsDialog(false)}>Close</Button>
                                </DialogActions>
                            </Dialog>
                            <Calendar
                                events={events}
                                handleHomeworkClick={handleHomeworkClick}
                                setEvents={setEvents}
                            />
                        </>
                    )}

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
                                            color={feedback.time === 1 ? 'black' : 'disabled'}
                                        />
                                    </Tooltip>

                                    <Tooltip title='Has extra material to practice'>
                                        <InsertDriveFileIcon
                                            fontSize='large'
                                            sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                            onClick={() => handleFeedbackClick('material')}
                                            color={feedback.material === 1 ? 'black' : 'disabled'}
                                        />
                                    </Tooltip>

                                    <Tooltip title='Is respectful and patient'>
                                        <SentimentSatisfiedAltIcon
                                            fontSize='large'
                                            sx={{ gridColumn: 1 / 3, row: 1, cursor: 'pointer' }}
                                            onClick={() => handleFeedbackClick('kind')}
                                            color={feedback.kind === 1 ? 'black' : 'disabled'}
                                        />
                                    </Tooltip>
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setGiveFeedback(false)}>Close</Button>
                                <Button variant='contained' onClick={handleFeedback}>
                                    Submit
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}
                </>
            )}
        </div>
    );
}
