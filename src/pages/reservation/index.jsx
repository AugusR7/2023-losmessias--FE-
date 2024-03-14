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
    CardActionArea,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
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
    const handleCloseHomeworkDialog = () => setOpenHomeworkDialog(false);

    const handleHomeworkResponse = (homework) => {
        if (homework.status !== "PENDING") return;
        setHomeworkToRespond(homework);
        setOpenHomeworkDialog(true);
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

    useEffect(() => {
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
            <Snackbar
                open={alert}
                autoHideDuration={6000}
                onClose={() => setAlert(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>{alertMessage}</Alert>
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
                            <div>
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
                                            {homeworks.map((homework, idx) => {
                                                const color = homework.status === "PENDING" ? "red" : homework.status === "DONE" ? "green" : "orange"

                                                return (// PONER UN GRID PARA QUE TODAS LAS CARTAS TENGAN ANCHO PAREJO
                                                    <Card sx={{ display: "flex", width: "100%", marginBottom: '1rem', marginRight: '1rem' }} key={idx} >
                                                        <Button onClick={() => handleHomeworkResponse(homework)} >
                                                            <CardContent sx={{ marginLeft: '1rem' }}>
                                                                <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: '1rem', justifyContent: 'center' }}>
                                                                    <Typography variant='h6' sx={{ color: color, fontWeight: 'bold' }}>{homework.status}</Typography>
                                                                    {homework.status === "PENDING" &&
                                                                        <Typography sx={{ color: "red", marginLeft: "0.5rem" }}>
                                                                            due {formatDate(homework.deadline)}
                                                                        </Typography>
                                                                    }
                                                                </div>
                                                                <div style={{ display: "flex", flexDirection: "row", alignItems: 'center', marginBottom: '1rem' }}>
                                                                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Assignment:</Typography>

                                                                    {homework.assignment.length > 0 ?// PONER UN GRID PARA QUE TODAS LAS CARTAS TENGAN ANCHO PAREJO
                                                                        <div>
                                                                            <Typography sx={{ marginLeft: '0.5rem' }}>{homework.assignment}</Typography>
                                                                        </div>
                                                                        :
                                                                        <Typography sx={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>Homework assignment determined by file</Typography>
                                                                    }
                                                                </div>
                                                                <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Files:</Typography>
                                                                    {homework.assignmentFile &&// PONER UN GRID PARA QUE TODAS LAS CARTAS TENGAN ANCHO PAREJO
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <Button onClick={() => handleDownload(homework.assignmentFile)}>
                                                                                <PictureAsPdfIcon fontSize='large' />
                                                                                <Typography sx={{ marginLeft: '0.5rem' }}>{homework.assignmentFile.fileName}</Typography>
                                                                            </Button>
                                                                            <Typography>{' - ' + (homework.assignmentFile.role.toLowerCase() === user.role ? user.firstName + ' ' + user.lastName : userInfo.firstName + ' ' + userInfo.lastName)}</Typography>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                {homework.status === "DONE" &&// PONER UN GRID PARA QUE TODAS LAS CARTAS TENGAN ANCHO PAREJO
                                                                    <>
                                                                        <Divider sx={{ marginTop: '1rem', marginBottom: '1rem' }} />
                                                                        <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Response:</Typography>
                                                                            {homework.response.length > 0 &&
                                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                    <Typography sx={{ marginLeft: '0.5rem' }}>{homework.response}</Typography>
                                                                                </div>
                                                                            }
                                                                        </div>

                                                                        {homework.responseFile && // PONER UN GRID PARA QUE TODAS LAS CARTAS TENGAN ANCHO PAREJO
                                                                            <div style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                                                                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Files attached:</Typography>
                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                    <Button onClick={() => handleDownload(homework.responseFile)}>
                                                                                        <PictureAsPdfIcon fontSize='large' />
                                                                                        <Typography sx={{ marginLeft: '0.5rem' }}>{homework.responseFile.fileName}</Typography>
                                                                                    </Button>
                                                                                    <Typography>{' - ' + (homework.responseFile.role.toLowerCase() === user.role ? user.firstName + ' ' + user.lastName : userInfo.firstName + ' ' + userInfo.lastName)}</Typography>
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                    </>
                                                                }
                                                            </CardContent>
                                                        </Button>
                                                    </Card>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

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
                </div>
            )}

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
