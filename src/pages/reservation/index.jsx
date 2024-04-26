import { useRouter } from 'next/router';
import HorizontalProfessorCard from '../reservations/components/HorizontalProfessorCard';
import Upload from '@/components/Upload';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    List,
    ListItemButton,
    Skeleton,
    Snackbar,
    Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import useWindowSize from '@/hooks/useWindowSize';
import HomeworkButton from '@/components/HomeworkButton';
import { HomeworkDialog } from '@/components/modals/HomeworkDialog';
import CloseIcon from '@mui/icons-material/Close';

function parse(dateTime) {
    let date = dateTime.slice(0, 3);
    let time = dateTime.slice(3, 7);
    date = date.join('-');
    time = time.join(':');

    return date + ' ' + time;
}

function formatDate(date) {
    let dateBig = date.split('T')[0];
    let time = date.split('T')[1];
    let dateItems = dateBig.split('-');
    return dateItems[2] + '/' + dateItems[1] + '/' + dateItems[0] + ' ' + time;
}

export default function Reservation() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({});
    const [comments, setComments] = useState([]);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [homeworks, setHomeWorks] = useState([]);
    const [uploadingHomeworks, setUploadingHomeworks] = useState([]);
    const [uploadingFileNames, setUploadingFileNames] = useState([]);
    const [uploadingComments, setUploadingComments] = useState([]);
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const user = useUser();
    const windowSize = useWindowSize();

    const [openHomeworkDialog, setOpenHomeworkDialog] = useState(false);
    const [alert, setAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [file, setFile] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [homeworkToRespond, setHomeworkToRespond] = useState({});
    const [homeworkDeleteDialog, setHomeworkDeleteDialog] = useState(false);
    const [homeworkToDelete, setHomeworkToDelete] = useState({});
    const handleCloseHomeworkDialog = () => setOpenHomeworkDialog(false);

    const handleHomeworkResponse = (homework) => {
        if (user.role !== "student") {
            setAlert(true);
            setAlertSeverity('error');
            setAlertMessage('Only students can answer homework');
            return
        }
        if (homework.status === "DONE") {
            setAlert(true);
            setAlertSeverity('error');
            setAlertMessage('This homework has already been answered');
            return
        }
        if (homework.status === "LATE") {
            setAlert(true);
            setAlertSeverity('warning');
            setAlertMessage('You can\'t answer this homework because it is outdated');
            return
        }
        if (homework.status === "PENDING" && user.role === "student") {
            setHomeworkToRespond(homework);
            setOpenHomeworkDialog(true);
        }
    }

    const handleFileChange = e => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };


    const handleSave = () => {
        if (file !== null || newMessage !== '') {
            var data = new FormData();
            data.append('file', file);
            data.append('response', newMessage);
            data.append('associatedId', user.id);
            setAlert(true);
            setAlertSeverity('info');
            setAlertMessage('Posting homework...');
            setOpenHomeworkDialog(false);


            setHomeWorks(prevHomeworks => prevHomeworks.filter(homework => homework.id !== homeworkToRespond.id));
            setUploadingHomeworks(prevHomeworks => [
                ...prevHomeworks,
                {
                    assignment: homeworkToRespond.assignment,
                    deadline: homeworkToRespond.deadline,
                    professorId: homeworkToRespond.professorId,
                    classReservationId: homeworkToRespond.classReservationId,
                    assignmentFile: homeworkToRespond.assignmentFile,
                    status: 'DONE',
                    responseFile: file,
                    response: newMessage,
                },
            ]);

            fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/homework/respond/` + homeworkToRespond.id, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                body: data,
            })
                .then(res => {
                    if (res.ok) {
                        setAlert(true);
                        setAlertSeverity('success');
                        setAlertMessage('Homework answered successfully');
                        res.json().then(data => {
                            setHomeWorks(prevHomeworks => {
                                return [
                                    ...prevHomeworks,
                                    {
                                        id: data.id,
                                        deadline: data.deadline,
                                        professorId: data.professorId,
                                        classReservationId: data.classReservationId,
                                        status: data.status,
                                        assignment: data.assignment,
                                        assignmentFile: data.assignmentFile,
                                        responseFile: data.responseFile,
                                        response: data.response,
                                    },
                                ];
                            });
                        });
                        setTimeout(() => {
                            setAlert(false);
                        }, 3000);
                    } else {
                        setAlert(true);
                        setAlertSeverity('error');
                        setAlertMessage('Error posting homework');
                        setTimeout(() => {
                            setAlert(false);
                        }, 3000);
                    }
                }).finally(() => {
                    setUploadingHomeworks(prevHomeworks => prevHomeworks.filter(homework =>
                        (homework.classReservationId !== homeworkToRespond.classReservationId) &&
                        (homework.professorId !== homeworkToRespond.professorId) &&
                        (homework.assignment !== homeworkToRespond.assignment) &&
                        (homework.assignmentFile !== homeworkToRespond.assignmentFile)))
                    setOpenHomeworkDialog(false);
                    setFile(null);
                    setNewMessage('');
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    const handleDelete = () => {
        setOpenHomeworkDialog(false);
        const homework = homeworkToDelete;
        const requestOptions = {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${user.token}` },
        };

        fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/homework/delete/${homework.id}`, requestOptions)
            .then(res => {
                if (res.ok) {
                    setHomeWorks(prevHomeworks => prevHomeworks.filter(h => h.id !== homework.id));
                    setAlert(true);
                    setAlertSeverity('success');
                    setAlertMessage('Homework deleted successfully');
                } else {
                    setAlert(true);
                    setAlertSeverity('error');
                    setAlertMessage('Error deleting homework');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setAlert(true);
                setAlertSeverity('error');
                setAlertMessage('Error deleting homework');
            }).finally(() => {
                setHomeworkDeleteDialog(false);
                setHomeworkToDelete({});
                setTimeout(() => {
                    setAlert(false);
                }, 3000);
            });
    }

    useEffect(() => {
        if (router.isReady) {
            if (user.id) {
                if (user.role === 'admin') router.push('/admin-landing');
                setIsLoadingContent(true);
                const requestOptions = {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/file/get-uploaded-data?id=${router.query.id}`, requestOptions)
                    .then(res => {
                        if (res.ok)
                            res.json().then(json => {
                                let comments = [];
                                let files = [];
                                json.forEach(e => {
                                    if (e.comment !== undefined) comments.push(e);
                                    else files.push(e);
                                });

                                setFiles(files);
                                setComments(comments);
                            })
                    }).then(() => {
                        fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/homework/getByClassReservation/${router.query.id}`, requestOptions)
                            .then(res => {
                                if (res.ok) {
                                    res.json().then(json => {
                                        setHomeWorks(json);
                                    });
                                }
                            })
                    })
                    .finally(() => setIsLoadingContent(false));

                if (user.role === 'student') {
                    fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/professor/${router.query.userId}`, requestOptions)
                        .then(res => {
                            if (res.status === 200)
                                return res.json()
                        })
                        .then(json => {
                            setUserInfo(json);
                        });
                } else {
                    fetch(`${process.env.NEXT_PUBLIC_API_URI}/api/student/${router.query.userId}`, requestOptions).then(res => {
                        if (res.ok)
                            res.json().then(json => {
                                setUserInfo(json);
                            });
                    });
                }
            } else {
                router.push('/');
            }
        }
    }, [user, router]);

    const handleClick = message => {
        setMessage(message);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setMessage('');
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

    return (
        <div style={{ width: '90%', margin: '2rem auto' }}>
            <HomeworkDialog
                open={openHomeworkDialog}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                file={file}
                handleFileChange={handleFileChange}
                handleClose={handleCloseHomeworkDialog}
                handleSave={handleSave}
            />
            <Dialog
                open={homeworkDeleteDialog}
                onClose={() => {
                    setHomeworkDeleteDialog(false)
                    setHomeworkToDelete({})
                }}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>{'Are you sure you want to delete this homework?'}</DialogTitle>
                <DialogContent>
                    <Typography id='alert-dialog-description'>
                        This action is irreversible. Once you delete this homework, you won&apos;t be able to recover it.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setHomeworkDeleteDialog(false)
                        setHomeworkToDelete({})
                    }} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color='primary' autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>


            <Snackbar
                open={alert}
                autoHideDuration={6000}
                onClose={() => setAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setAlert(false)} severity={alertSeverity} sx={{ width: '100%' }}>{alertMessage}</Alert>
            </Snackbar>
            <div
                style={
                    windowSize.width > 500
                        ? { display: 'flex', alignItems: 'end', justifyContent: 'space-between' }
                        : { display: 'flex', flexDirection: 'column', gap: 15 }
                }
            >
                <HorizontalProfessorCard professor={userInfo} />
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 15,
                        height: '100%',
                    }}
                >
                    <Upload
                        id={router.query.id}
                        setFiles={setFiles}
                        setComments={setComments}
                        setUploadingFileNames={setUploadingFileNames}
                        setUploadingComments={setUploadingComments}
                    />
                    {user.role === 'professor' && (
                        <HomeworkButton
                            id={router.query.id}
                            setHomeWorks={setHomeWorks}
                            setUploadingHomeworks={setUploadingHomeworks}
                        />
                    )}
                </Box>
            </div>

            {windowSize.width > 500 && (
                <>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', margin: '2rem auto', justifyContent: 'space-between' }}>
                            <div style={{ width: '50%', padding: '1.5rem' }}>
                                {isLoadingContent ? (
                                    <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                                ) : (
                                    <List>
                                        {uploadingComments.map((comment, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    flexDirection: 'row',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgb(144, 199, 255)',
                                                    height: 50,
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                                <Typography>Posting </Typography>{' '}
                                                <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {comment}</Typography>
                                            </div>
                                        ))}
                                        {comments.map((com, idx) => {
                                            let author = userInfo;
                                            if (com.role.toLowerCase() === user.role) author = user;
                                            return (
                                                <ListItemButton
                                                    onClick={() => handleClick(com.comment)}
                                                    key={idx}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: com.role.toLowerCase() !== user.role ? 'flex-end' : 'flex-start',
                                                    }}
                                                >
                                                    <Typography>{author.firstName + ' ' + author.lastName + ' - ' + com.comment}</Typography>
                                                    <Typography variant='caption' sx={{ marginLeft: '0.5rem' }}>
                                                        {parse(com.uploadedDateTime)}
                                                    </Typography>
                                                </ListItemButton>
                                            );
                                        })}
                                    </List>
                                )}
                            </div>

                            <Divider orientation='vertical' flexItem />

                            <div style={{ width: '50%', padding: '1.5rem' }}>
                                {isLoadingContent ? (
                                    <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                                ) : (
                                    <>
                                        {uploadingFileNames.map((fileName, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    flexDirection: 'row',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgb(144, 199, 255)',
                                                    height: 50,
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                                <Typography>Uploading </Typography>{' '}
                                                <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {fileName}</Typography>
                                                <PictureAsPdfIcon fontSize='large' sx={{ ml: 2, mr: 2, color: 'gray' }} />
                                            </div>
                                        ))}
                                        {files.map((file, idx) => {
                                            let author = userInfo;
                                            if (file.role.toLowerCase() === user.role) author = user;
                                            return (
                                                <div style={{ display: 'flex', alignItems: 'center' }} key={idx}>
                                                    <Button onClick={() => handleDownload(file)}>
                                                        <PictureAsPdfIcon fontSize='large' />
                                                        <Typography sx={{ marginLeft: '0.5rem' }}>{file.fileName}</Typography>
                                                    </Button>
                                                    <Typography>{' - ' + author.firstName + ' ' + author.lastName}</Typography>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', margin: '2rem auto', justifyContent: 'space-between' }}>
                            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                                Homeworks
                            </Typography>
                            <div style={{ width: '100%', padding: '1.5rem', flexDirection: "column", display: 'flex' }}>
                                {isLoadingContent ? (
                                    <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                                ) : (
                                    <>
                                        {uploadingHomeworks.map((idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    flexDirection: 'row',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgb(144, 199, 255)',
                                                    height: 50,
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                                <Typography>Posting homework...</Typography>
                                            </div>
                                        ))}
                                        {homeworks.length > 0 ? homeworks.map((homework, idx) => {
                                            const color = homework.status === "PENDING" ? "red" : homework.status === "DONE" ? "green" : "orange";

                                            return (
                                                <Card sx={{ display: "flex", width: "100%", marginBottom: '1rem', marginRight: '1rem' }} key={idx} >
                                                    <Button onClick={() => handleHomeworkResponse(homework)} sx={{ width: '100%' }}>
                                                        <CardContent sx={{ marginLeft: '1rem', width: '100%' }}>
                                                            <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: '1rem', justifyContent: 'center' }}>
                                                                <Typography variant='h6' sx={{ color: color, fontWeight: 'bold' }}>{homework.status}</Typography>
                                                                {homework.status === "PENDING" &&
                                                                    <Typography sx={{ color: "red", marginLeft: "0.5rem" }}>
                                                                        due {formatDate(homework.deadline)}
                                                                    </Typography>
                                                                }
                                                                {homework.status === "LATE" &&
                                                                    <Typography sx={{ color: "orange", marginLeft: "0.5rem" }}>
                                                                        overdue {formatDate(homework.deadline)}
                                                                    </Typography>
                                                                }
                                                            </div>
                                                            <Grid container>
                                                                <Grid item xs={3} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Assignment:</Typography>
                                                                </Grid>
                                                                <Grid item xs={9} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                    {homework.assignment.length > 0 ?
                                                                        <div>
                                                                            <Typography sx={{ marginLeft: '0.5rem' }}>{homework.assignment}</Typography>
                                                                        </div>
                                                                        :
                                                                        <Typography sx={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>Homework assignment determined by file</Typography>
                                                                    }
                                                                </Grid>
                                                            </Grid>

                                                            {homework.assignmentFile &&
                                                                <Grid container>
                                                                    <Grid item xs={3} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>File attached:</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={9} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                        <Button onClick={() => handleDownload(homework.assignmentFile)}>
                                                                            <PictureAsPdfIcon fontSize='large' />
                                                                            <Typography sx={{ marginLeft: '0.5rem' }}>{homework.assignmentFile.fileName}</Typography>
                                                                        </Button>
                                                                        <Typography>{' - ' + (homework.assignmentFile.role.toLowerCase() === user.role ? user.firstName + ' ' + user.lastName : userInfo.firstName + ' ' + userInfo.lastName)}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            }
                                                            {homework.status === "DONE" &&
                                                                <>
                                                                    <Divider sx={{ marginTop: '1rem', marginBottom: '1rem' }} />
                                                                    {homework.response.length > 0 &&
                                                                        <Grid container>
                                                                            <Grid item xs={3} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Response:</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={9} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                {homework.response.length > 0 &&
                                                                                    <Typography sx={{ marginLeft: '0.5rem' }}>{homework.response}</Typography>
                                                                                }
                                                                            </Grid>
                                                                        </Grid>
                                                                    }

                                                                    {homework.responseFile &&
                                                                        <Grid container>
                                                                            <Grid item xs={3} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>File attached:</Typography>
                                                                            </Grid>
                                                                            <Grid item xs={9} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                <Button onClick={() => handleDownload(homework.responseFile)}>
                                                                                    <PictureAsPdfIcon fontSize='large' />
                                                                                    <Typography sx={{ marginLeft: '0.5rem' }}>{homework.responseFile.fileName}</Typography>
                                                                                </Button>
                                                                                <Typography>{' - ' + (homework.responseFile.role.toLowerCase() === user.role ? user.firstName + ' ' + user.lastName : userInfo.firstName + ' ' + userInfo.lastName)}</Typography>
                                                                            </Grid>
                                                                        </Grid>
                                                                    }
                                                                </>
                                                            }
                                                        </CardContent>
                                                    </Button>
                                                    {user.role === "professor" &&
                                                        <Button
                                                            onClick={() => {
                                                                setHomeworkDeleteDialog(true);
                                                                setHomeworkToDelete(homework);
                                                            }}
                                                            sx={{
                                                                position: 'relative',
                                                                color: 'red',
                                                                backgroundColor: '#edf5fb',
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            <CloseIcon fontSize='small' />
                                                        </Button>
                                                    }
                                                </Card>
                                            );
                                        }) :
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%',
                                                padding: '1rem',
                                                borderRadius: 5
                                            }}>
                                                <Typography variant='h6' sx={{ fontStyle: 'italic' }}>No homeworks to display</Typography>
                                            </div>
                                        }
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )
            }

            {windowSize.width <= 500 && (
                <div style={{ margin: '2rem auto' }}>
                    {isLoadingContent ? (
                        <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                    ) : (
                        <List>
                            {uploadingComments.map((comment, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        flexDirection: 'row',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'rgb(144, 199, 255)',
                                        height: 50,
                                        borderRadius: 10,
                                    }}
                                >
                                    <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                    <Typography>Posting </Typography>{' '}
                                    <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {comment}</Typography>
                                </div>
                            ))}
                            {comments.map((com, idx) => {
                                let author = userInfo;
                                if (com.role.toLowerCase() === user.role) author = user;
                                return (
                                    <ListItemButton
                                        onClick={() => handleClick(com.comment)}
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: com.role.toLowerCase() !== user.role ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Typography>{author.firstName + ' ' + author.lastName}</Typography>
                                        <Typography variant='caption' sx={{ marginLeft: '0.5rem' }}>
                                            {parse(com.uploadedDateTime)}
                                        </Typography>
                                    </ListItemButton>
                                );
                            })}

                            <Divider />

                            {uploadingFileNames.map((fileName, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        flexDirection: 'row',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'rgb(144, 199, 255)',
                                        height: 50,
                                        borderRadius: 10,
                                    }}
                                >
                                    <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                    <Typography>Uploading </Typography>{' '}
                                    <Typography sx={{ ml: 1, fontWeight: 'bold', fontStyle: 'italic' }}> {fileName}</Typography>
                                    <PictureAsPdfIcon fontSize='large' sx={{ ml: 2, mr: 2, color: 'gray' }} />
                                </div>
                            ))}
                            {files.map((file, idx) => {
                                let author = userInfo;
                                if (file.role.toLowerCase() === user.role) author = user;

                                return (
                                    <ListItemButton
                                        onClick={() => handleDownload(file)}
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: file.role.toLowerCase() !== user.role ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Typography>{author.firstName + ' ' + author.lastName}</Typography>

                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <PictureAsPdfIcon fontSize='large' color='primary' />
                                            <Typography sx={{ marginLeft: '0.5rem' }} color='primary'>
                                                {file.fileName}
                                            </Typography>
                                        </div>
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    )}
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                                Homeworks
                            </Typography><br />
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                                <div style={{ width: '100%', flexDirection: "column", display: 'flex' }}>
                                    {isLoadingContent ? (
                                        <Skeleton variant='rectangular' height={60} style={{ borderRadius: 10 }} />
                                    ) : (
                                        <>
                                            {uploadingHomeworks.map((idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        flexDirection: 'row',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        backgroundColor: 'rgb(144, 199, 255)',
                                                        height: 50,
                                                        borderRadius: 10,
                                                    }}
                                                >
                                                    <CircularProgress size={30} sx={{ ml: 2, mr: 2 }} />
                                                    <Typography>Posting homework...</Typography>
                                                </div>
                                            ))}
                                            {homeworks.length > 0 ? homeworks.map((homework, idx) => {
                                                const color = homework.status === "PENDING" ? "red" : homework.status === "DONE" ? "green" : "orange";

                                                return (
                                                    <Card sx={{ display: "flex", width: "100%", marginBottom: '1rem', marginRight: '1rem', flexDirection: 'column' }} key={idx} >
                                                        <Button onClick={() => handleHomeworkResponse(homework)} sx={{ width: '100%' }}>
                                                            <CardContent sx={{ marginLeft: '1rem', width: '100%' }}>
                                                                <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: '1rem', justifyContent: 'center' }}>
                                                                    <Typography variant='h6' sx={{ color: color, fontWeight: 'bold' }}>{homework.status}</Typography>
                                                                    {homework.status === "PENDING" &&
                                                                        <Typography sx={{ color: "red", marginLeft: "0.5rem" }}>
                                                                            due {formatDate(homework.deadline)}
                                                                        </Typography>
                                                                    }
                                                                </div>
                                                                <Grid container>
                                                                    <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Assignment:</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                        {homework.assignment.length > 0 ?
                                                                            <div>
                                                                                <Typography sx={{ marginLeft: '0.5rem' }}>{homework.assignment}</Typography>
                                                                            </div>
                                                                            :
                                                                            <Typography sx={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>Homework assignment determined by file</Typography>
                                                                        }
                                                                    </Grid>
                                                                </Grid>

                                                                {homework.assignmentFile &&
                                                                    <Grid container>
                                                                        <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>File attached:</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                            <Button onClick={() => handleDownload(homework.assignmentFile)}>
                                                                                <PictureAsPdfIcon fontSize='large' />
                                                                                <Typography sx={{ marginLeft: '0.5rem' }}>{homework.assignmentFile.fileName}</Typography>
                                                                            </Button>
                                                                            <Typography>{' - ' + (homework.assignmentFile.role.toLowerCase() === user.role ? user.firstName + ' ' + user.lastName : userInfo.firstName + ' ' + userInfo.lastName)}</Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                }
                                                                {homework.status === "DONE" &&
                                                                    <>
                                                                        <Divider sx={{ marginTop: '1rem', marginBottom: '1rem' }} />
                                                                        {homework.response.length > 0 &&
                                                                            <Grid container>
                                                                                <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Response:</Typography>
                                                                                </Grid>
                                                                                <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                    {homework.response.length > 0 &&
                                                                                        <Typography sx={{ marginLeft: '0.5rem' }}>{homework.response}</Typography>
                                                                                    }
                                                                                </Grid>
                                                                            </Grid>
                                                                        }

                                                                        {homework.responseFile &&
                                                                            <Grid container>
                                                                                <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>File attached:</Typography>
                                                                                </Grid>
                                                                                <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                                    <Button onClick={() => handleDownload(homework.responseFile)}>
                                                                                        <PictureAsPdfIcon fontSize='large' />
                                                                                        <Typography sx={{ marginLeft: '0.5rem' }}>{homework.responseFile.fileName}</Typography>
                                                                                    </Button>
                                                                                    <Typography>{' - ' + (homework.responseFile.role.toLowerCase() === user.role ? user.firstName + ' ' + user.lastName : userInfo.firstName + ' ' + userInfo.lastName)}</Typography>
                                                                                </Grid>
                                                                            </Grid>
                                                                        }
                                                                    </>
                                                                }
                                                            </CardContent>
                                                        </Button>
                                                        {user.role === "professor" && homework.status === "PENDING" &&
                                                            <Button
                                                                onClick={() => {
                                                                    setHomeworkDeleteDialog(true);
                                                                    setHomeworkToDelete(homework);
                                                                }}
                                                                sx={{
                                                                    position: 'relative',
                                                                    color: 'red',
                                                                    backgroundColor: '#edf5fb',
                                                                    display: 'flex',
                                                                    borderRadius: 0
                                                                }}
                                                            >
                                                                <CloseIcon fontSize='small' />
                                                            </Button>
                                                        }
                                                    </Card>
                                                );
                                            }) :
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: '100%',
                                                    padding: '1rem',
                                                    borderRadius: 5
                                                }}>
                                                    <Typography variant='h6' sx={{ fontStyle: 'italic' }}>No homeworks to display</Typography>
                                                </div>
                                            }
                                        </>
                                    )}
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            )
            }

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Message</DialogTitle>

                <DialogContent>
                    <Typography>{message}</Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
